import {
  Shift,
  PunchSettings,
  ArrivalStatus,
  DepartureStatus,
  AttendanceStatus,
  AttendanceRecord,
} from '../types';

export interface ServerTimeInfo {
  date: Date;
  iso: string;
  dateStr: string; // YYYY-MM-DD
  time24: string;  // HH:mm
  time12: string;  // hh:mm A
  minutesOfDay: number;
}

/**
 * Gets consistent server-time representations in the configured timezone (default Asia/Kolkata).
 */
export function getServerTime(timezone = 'Asia/Kolkata', specificDate?: Date): ServerTimeInfo {
  const d = specificDate || new Date();
  
  // Format in target timezone
  const formatter24 = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const formatter12 = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const time24 = formatter24.format(d);
  const time12 = formatter12.format(d);
  const dateStr = dateFormatter.format(d); // YYYY-MM-DD

  const [h, m] = time24.split(':').map((n) => parseInt(n, 10));
  const minutesOfDay = (h || 0) * 60 + (m || 0);

  return {
    date: d,
    iso: d.toISOString(),
    dateStr,
    time24,
    time12,
    minutesOfDay,
  };
}

/**
 * Parses time formats such as "09:30", "09:30 AM", "18:00", "06:30 PM" to minutes of day (0-1439).
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  const is12 = /AM|PM/i.test(clean);

  if (is12) {
    const parts = clean.split(/\s+/);
    const [hh, mm] = parts[0].split(':').map((n) => parseInt(n, 10));
    const isPM = parts[1]?.toUpperCase() === 'PM';
    let h = (hh || 0) % 12;
    if (isPM) h += 12;
    return h * 60 + (mm || 0);
  }

  const [hh, mm] = clean.split(':').map((n) => parseInt(n, 10));
  return (hh || 0) * 60 + (mm || 0);
}

/**
 * Formats minutes of day into "hh:mm AM/PM"
 */
export function formatMinutesToTime12(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm} ${ampm}`;
}

export function formatDurationHoursMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m < 10 ? '0' + m : m}m`;
}

export interface PunchInEvaluationResult {
  allowed: boolean;
  message?: string;
  punchInStatus: ArrivalStatus;
  earlyMinutes: number;
  lateMinutes: number;
  graceAdjustedLateMinutes: number;
  serverTime: ServerTimeInfo;
}

/**
 * Centralized evaluation of Punch-In attempt
 */
export function evaluatePunchIn(
  shift: Shift,
  settings: PunchSettings,
  timezone = 'Asia/Kolkata',
  overrideTime?: Date
): PunchInEvaluationResult {
  const serverTime = getServerTime(timezone, overrideTime);
  const punchMins = serverTime.minutesOfDay;
  const shiftStartMins = parseTimeToMinutes(shift.startTime);

  const gracePeriod = shift.gracePeriodMinutes ?? settings.gracePeriodMinutes ?? 10;
  const allowEarly = shift.allowEarlyPunchIn ?? settings.allowEarlyPunchIn ?? true;
  const maxEarlyWindow = shift.maxEarlyPunchInMinutes ?? settings.maxEarlyPunchInMinutes ?? 60;
  const allowLate = settings.allowLatePunchIn ?? true;

  // Arrival calculation
  const diff = punchMins - shiftStartMins;

  if (diff < 0) {
    // Punched in BEFORE shift start
    const earlyMinutes = Math.abs(diff);

    if (!allowEarly) {
      return {
        allowed: false,
        message: 'Early punch-in is disabled by administrator policy.',
        punchInStatus: 'EARLY',
        earlyMinutes,
        lateMinutes: 0,
        graceAdjustedLateMinutes: 0,
        serverTime,
      };
    }

    if (earlyMinutes > maxEarlyWindow) {
      const allowedFromMins = shiftStartMins - maxEarlyWindow;
      const allowedFromTime = formatMinutesToTime12(allowedFromMins);
      const shiftStartTime = formatMinutesToTime12(shiftStartMins);
      return {
        allowed: false,
        message: `Early Punch-In Not Available. You can punch in from: ${allowedFromTime}. Shift starts at: ${shiftStartTime}.`,
        punchInStatus: 'EARLY',
        earlyMinutes,
        lateMinutes: 0,
        graceAdjustedLateMinutes: 0,
        serverTime,
      };
    }

    return {
      allowed: true,
      punchInStatus: 'EARLY',
      earlyMinutes,
      lateMinutes: 0,
      graceAdjustedLateMinutes: 0,
      serverTime,
    };
  }

  if (diff <= gracePeriod) {
    // Punched in ON TIME (at shift start or within grace window)
    return {
      allowed: true,
      punchInStatus: 'ON_TIME',
      earlyMinutes: 0,
      lateMinutes: 0,
      graceAdjustedLateMinutes: 0,
      serverTime,
    };
  }

  // Punched in LATE (after grace period)
  if (!allowLate) {
    return {
      allowed: false,
      message: 'Late punch-in cutoff has been reached for this shift.',
      punchInStatus: 'LATE',
      earlyMinutes: 0,
      lateMinutes: diff,
      graceAdjustedLateMinutes: diff - gracePeriod,
      serverTime,
    };
  }

  return {
    allowed: true,
    punchInStatus: 'LATE',
    earlyMinutes: 0,
    lateMinutes: diff,
    graceAdjustedLateMinutes: diff - gracePeriod,
    serverTime,
  };
}

export interface PunchOutEvaluationResult {
  punchOutStatus: DepartureStatus;
  attendanceStatus: AttendanceStatus;
  attendanceValue: number;
  workedMinutes: number;
  elapsedMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  earlyMinutes: number;
  lateMinutes: number;
  serverTime: ServerTimeInfo;
}

/**
 * Centralized evaluation of Punch-Out and final attendance calculations
 */
export function evaluatePunchOut(
  existingPunchInAt: string | null | undefined,
  existingPunchInTime: string | null | undefined,
  shift: Shift,
  settings: PunchSettings,
  timezone = 'Asia/Kolkata',
  overridePunchOutTime?: Date,
  earlyArrivalMinutes = 0
): PunchOutEvaluationResult {
  const serverTime = getServerTime(timezone, overridePunchOutTime);

  // Compute elapsed time from server timestamps or formatted time
  let elapsedMinutes = 0;
  if (existingPunchInAt) {
    const inDate = new Date(existingPunchInAt);
    const diffMs = serverTime.date.getTime() - inDate.getTime();
    elapsedMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  } else if (existingPunchInTime) {
    const inMins = parseTimeToMinutes(existingPunchInTime);
    let outMins = serverTime.minutesOfDay;
    // Check night shift crossing midnight
    if (outMins < inMins) {
      outMins += 1440;
    }
    elapsedMinutes = Math.max(0, outMins - inMins);
  }

  // Break policy: if shift duration > 4 hours, apply break duration
  const configuredBreak = shift.breakDurationMinutes ?? settings.breakDurationMinutes ?? 60;
  // If employee worked less than half-day or 4 hours, break is not deducted from partial shift
  const effectiveBreak = elapsedMinutes >= 4 * 60 + configuredBreak
    ? configuredBreak
    : elapsedMinutes > 4 * 60
    ? elapsedMinutes - 4 * 60
    : 0;

  const workedMinutes = Math.max(0, elapsedMinutes - effectiveBreak);

  // Thresholds
  const halfDayThresholdMinutes =
    (shift.halfDayThresholdHours ?? settings.minHoursRequiredForHalfDay ?? 4) * 60;
  const fullDayThresholdMinutes =
    (shift.fullDayThresholdHours ?? settings.minHoursRequiredForFullDay ?? 8) * 60;

  // Attendance Status and Value
  let attendanceStatus: AttendanceStatus;
  let attendanceValue: number;

  if (workedMinutes < halfDayThresholdMinutes) {
    attendanceStatus = 'EARLY_OUT';
    attendanceValue = 0;
  } else if (workedMinutes < fullDayThresholdMinutes) {
    attendanceStatus = 'HALF DAY';
    attendanceValue = settings.halfDayAttendanceValue ?? 0.5;
  } else {
    attendanceStatus = 'PRESENT';
    attendanceValue = settings.fullDayAttendanceValue ?? 1.0;
  }

  // Departure Status
  const shiftEndMins = parseTimeToMinutes(shift.endTime);
  const punchOutMins = serverTime.minutesOfDay;
  const isEarlyOutDeparture = punchOutMins < shiftEndMins;

  // Overtime Calculation according to configured Admin policy
  let overtimeMinutes = 0;
  const enableOvertime = shift.enableOvertime ?? settings.enableOvertime ?? true;

  if (enableOvertime) {
    if (settings.overtimeStartRule === 'AFTER_REQUIRED_HOURS') {
      if (workedMinutes > fullDayThresholdMinutes) {
        overtimeMinutes = workedMinutes - fullDayThresholdMinutes;
      }
    } else {
      // Default: AFTER_SHIFT_END
      if (punchOutMins > shiftEndMins && workedMinutes >= halfDayThresholdMinutes) {
        const postShift = punchOutMins - shiftEndMins;
        if (settings.countLateWorkTowardOvertime) {
          overtimeMinutes = postShift;
        }
      }
      if (settings.countEarlyWorkAsOvertime && earlyArrivalMinutes > 0) {
        overtimeMinutes += earlyArrivalMinutes;
      }
    }
  }

  let punchOutStatus: DepartureStatus;
  if (isEarlyOutDeparture) {
    punchOutStatus = 'EARLY_OUT';
  } else if (overtimeMinutes > 0) {
    punchOutStatus = 'OVERTIME';
  } else {
    punchOutStatus = 'NORMAL_OUT';
  }

  return {
    punchOutStatus,
    attendanceStatus,
    attendanceValue,
    workedMinutes,
    elapsedMinutes,
    breakMinutes: effectiveBreak,
    overtimeMinutes,
    earlyMinutes: earlyArrivalMinutes,
    lateMinutes: 0,
    serverTime,
  };
}

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Calendar,
  Building,
  Laptop,
  Building2,
  CalendarDays,
  Shield,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { WorkMode, AttendanceRecord } from '../../types';
import { DigitalIdCard } from '../common/DigitalIdCard';
import { useViewport } from '../../hooks/useViewport';
import { StaffMobileDashboard } from './StaffMobileDashboard';

interface StaffDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenLeaveModal: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigate,
  onOpenLeaveModal,
}) => {
  const { isMobile } = useViewport();
  const {
    currentUser,
    employees,
    shifts,
    attendance,
    holidays,
    punchSettings,
    punchIn,
    punchOut,
  } = useAttendance();

  // If viewing on mobile viewport, render dedicated mobile staff layout
  if (isMobile) {
    return (
      <StaffMobileDashboard
        onNavigate={onNavigate}
        onOpenLeaveModal={onOpenLeaveModal}
      />
    );
  }

  // Find active employee record
  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees[0];

  const assignedShift =
    shifts.find((s) => s.id === currentEmp?.shiftId) ||
    (currentEmp?.shiftStartTime && currentEmp?.shiftEndTime
      ? {
          id: currentEmp.shiftId || `SHIFT_CUSTOM_${currentEmp.id}`,
          name: `${currentEmp.name} Timing (${currentEmp.shiftStartTime} - ${currentEmp.shiftEndTime})`,
          startTime: currentEmp.shiftStartTime,
          endTime: currentEmp.shiftEndTime,
          gracePeriodMinutes: currentEmp.gracePeriodMinutes ?? 15,
          minWorkingHours: 8,
          maxWorkingHours: 12,
        }
      : shifts[0] || null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const todayRecord = attendance.find(
    (r) => r.employeeId === currentEmp?.id && r.date === todayStr
  );

  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>(
    todayRecord?.workMode || currentEmp?.defaultWorkMode || 'OFFICE'
  );
  const [punchFeedback, setPunchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (todayRecord?.workMode) {
      setSelectedWorkMode(todayRecord.workMode);
    } else if (currentEmp?.defaultWorkMode) {
      setSelectedWorkMode(currentEmp.defaultWorkMode);
    }
  }, [currentEmp?.id, currentEmp?.defaultWorkMode, todayRecord?.workMode]);

  // Live elapsed counter calculated from exact server punchIn timestamp
  const calculateCurrentElapsed = () => {
    if (!todayRecord?.punchIn) return 0;
    if (todayRecord.punchOut && todayRecord.workingHoursMinutes !== undefined) {
      return todayRecord.workingHoursMinutes;
    }
    if (todayRecord.punchInAt) {
      const startMs = new Date(todayRecord.punchInAt).getTime();
      const nowMs = Date.now();
      return Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60)));
    }
    const parts = todayRecord.punchIn.split(' ');
    const [h, m] = parts[0].split(':').map((n) => parseInt(n, 10));
    let startMin = (h % 12) * 60 + m;
    if (parts[1]?.toUpperCase() === 'PM') startMin += 720;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, nowMin - startMin);
  };

  const [elapsedMinutes, setElapsedMinutes] = useState(calculateCurrentElapsed());
  const [showPunchOutConfirm, setShowPunchOutConfirm] = useState(false);

  useEffect(() => {
    setElapsedMinutes(calculateCurrentElapsed());
    let interval: any;
    if (
      todayRecord &&
      !todayRecord.punchOut &&
      (todayRecord.status === 'WORKING' ||
        todayRecord.status === 'IN_PROGRESS' ||
        todayRecord.status === 'LATE')
    ) {
      interval = setInterval(() => {
        setElapsedMinutes(calculateCurrentElapsed());
      }, 10000); // 10 second ticker
    }
    return () => clearInterval(interval);
  }, [todayRecord?.punchIn, todayRecord?.punchInAt, todayRecord?.punchOut, todayRecord?.status]);

  const handlePunchInClick = () => {
    if (!currentEmp) {
      setPunchFeedback({ type: 'error', message: 'No linked employee profile found.' });
      return;
    }
    setPunchFeedback(null);
    const res = punchIn(currentEmp.id, selectedWorkMode);
    if (res.success) {
      setPunchFeedback({ type: 'success', message: res.message });
    } else {
      setPunchFeedback({ type: 'error', message: res.message });
    }
  };

  const handleConfirmPunchOut = () => {
    setShowPunchOutConfirm(false);
    if (!currentEmp) {
      setPunchFeedback({ type: 'error', message: 'No linked employee profile found.' });
      return;
    }
    setPunchFeedback(null);
    const res = punchOut(currentEmp.id);
    if (res.success) {
      setPunchFeedback({ type: 'success', message: res.message });
    } else {
      setPunchFeedback({ type: 'error', message: res.message });
    }
  };

  const getExpectedStatus = (mins: number) => {
    const halfDay = ((assignedShift?.halfDayThresholdHours ?? punchSettings?.minHoursRequiredForHalfDay) ?? 4) * 60;
    const fullDay = ((assignedShift?.fullDayThresholdHours ?? punchSettings?.minHoursRequiredForFullDay) ?? 8) * 60;
    if (mins < halfDay) return { text: 'EARLY OUT / INSUFFICIENT HOURS (0 Day)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (mins < fullDay) return { text: 'HALF DAY (0.5 Day)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'PRESENT (1.0 Day)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const formatElapsedTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m < 10 ? '0' + m : m}m`;
  };

  // Recent personal history
  const personalHistory = attendance
    .filter((r) => r.employeeId === currentEmp?.id)
    .slice(0, 5);

  // Next upcoming holiday
  const nextHoliday = holidays.find((h) => h.date >= todayStr) || holidays[0] || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Top Staff Greeting Banner (Requirement 11) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Self-Service Portal
          </span>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight mt-1.5">
            Good Morning, {currentEmp?.name || currentUser?.name || 'Staff Member'}
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            {formattedToday} · {assignedShift ? `Standard Shift: ${assignedShift.startTime} to ${assignedShift.endTime}` : 'Real-time biometric attendance punch and shift telemetry'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLeaveModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors"
          >
            Apply Leave
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-colors shadow-xs"
          >
            My Calendar
          </button>
        </div>
      </div>

      {/* Main Grid: Left Digital ID Card + Right Attendance Punch Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Digital ID Card Widget (Requirement 10) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Digital ID Card</h3>
              <span className="text-[10px] text-slate-400 font-mono">STAFFPASS v2</span>
            </div>
            {currentEmp && (
              <DigitalIdCard
                employee={currentEmp}
                shift={assignedShift || undefined}
              />
            )}
          </div>

          {/* Quick Schedule Notice */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Assigned Shift & Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Scheduled Hours</span>
                <span className="font-bold text-slate-900 font-mono">
                  {assignedShift ? `${assignedShift.startTime} - ${assignedShift.endTime}` : '09:00 - 18:00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Grace Buffer</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {assignedShift ? `${assignedShift.gracePeriodMinutes || 10} minutes` : '10 minutes'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Next Upcoming Holiday</span>
                <span className="font-medium text-purple-700">
                  {nextHoliday ? `${nextHoliday.name} (${nextHoliday.date})` : 'No upcoming holidays'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: MAIN TODAY'S ATTENDANCE PUNCH CARD (Requirement 11, 12, 13, 14) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Today's Attendance Status
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {formattedToday}
                </h2>
              </div>

              {/* Status and Arrival Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {todayRecord?.punchIn && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      todayRecord.punchInStatus === 'EARLY' || (todayRecord.earlyMinutes && todayRecord.earlyMinutes > 0)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : todayRecord.punchInStatus === 'LATE' || (todayRecord.lateMinutes && todayRecord.lateMinutes > 0)
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {todayRecord.punchInStatus === 'EARLY' || (todayRecord.earlyMinutes && todayRecord.earlyMinutes > 0)
                      ? `Early Arrival: ${todayRecord.earlyMinutes}m`
                      : todayRecord.punchInStatus === 'LATE' || (todayRecord.lateMinutes && todayRecord.lateMinutes > 0)
                      ? `Late Arrival: ${todayRecord.lateMinutes}m`
                      : 'On-Time Arrival'}
                  </span>
                )}
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    todayRecord?.status === 'WORKING'
                      ? 'bg-emerald-100 text-[#087A4B] animate-pulse'
                      : todayRecord?.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : todayRecord?.status === 'HALF DAY'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : todayRecord?.status === 'EARLY_OUT'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : todayRecord?.status === 'LATE'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : todayRecord?.status === 'ON LEAVE'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      todayRecord?.status === 'WORKING'
                        ? 'bg-emerald-500'
                        : todayRecord?.status === 'PRESENT'
                        ? 'bg-emerald-500'
                        : todayRecord?.status === 'HALF DAY' || todayRecord?.status === 'LATE'
                        ? 'bg-amber-500'
                        : todayRecord?.status === 'EARLY_OUT'
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>{todayRecord?.status || 'NOT PUNCHED IN'}</span>
                </span>
              </div>
            </div>

            {/* Work Mode Selector (Per-Employee Admin Permission) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Work Location Mode for Today
                  </label>
                  {currentEmp?.allowFlexibleWorkMode ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#087A4B]" />
                      Work From Anywhere Allowed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Locked: {currentEmp?.defaultWorkMode}
                    </span>
                  )}
                </div>

                {!currentEmp?.allowFlexibleWorkMode && (
                  <span className="text-[10px] text-slate-400">
                    Contact Admin to enable flexible work from anywhere
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {(['OFFICE', 'WORK FROM HOME', 'HYBRID'] as WorkMode[]).map((mode) => {
                  const isAllowed = Boolean(currentEmp?.allowFlexibleWorkMode);
                  const isSelected = isAllowed
                    ? selectedWorkMode === mode
                    : currentEmp?.defaultWorkMode === mode;
                  const isPunched = Boolean(todayRecord && todayRecord.status !== 'NOT PUNCHED IN');
                  const isDisabled = !isAllowed || isPunched;

                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isAllowed && !isPunched) {
                          setSelectedWorkMode(mode);
                        }
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-[#087A4B] text-white border-[#087A4B] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      } ${!isAllowed && !isSelected ? 'opacity-40 cursor-not-allowed bg-slate-100/60' : ''}`}
                    >
                      {mode === 'OFFICE' && <Building2 className="w-3.5 h-3.5" />}
                      {mode === 'WORK FROM HOME' && <Laptop className="w-3.5 h-3.5" />}
                      {mode === 'HYBRID' && <MapPin className="w-3.5 h-3.5" />}
                      <span className="truncate">{mode}</span>
                    </button>
                  );
                })}
              </div>

              {!currentEmp?.allowFlexibleWorkMode && (
                <p className="mt-2 text-[11px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="font-semibold text-slate-700">Notice:</span> Work from home or
                  hybrid selection is restricted for your account. You are assigned to{' '}
                  <strong className="text-slate-900">{currentEmp?.defaultWorkMode}</strong> mode.
                  Admin can enable flexible mode in Employee Management.
                </p>
              )}
            </div>

            {/* Punch Metrics Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Punch-In Recorded</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {todayRecord?.punchIn || '--:--'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Shift start: {assignedShift ? assignedShift.startTime : '09:00'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Current Working Duration</span>
                <span className="text-base font-bold font-mono text-[#087A4B]">
                  {todayRecord?.status === 'WORKING'
                    ? formatElapsedTime(elapsedMinutes)
                    : todayRecord?.workingHoursMinutes
                    ? formatElapsedTime(todayRecord.workingHoursMinutes)
                    : '0h 00m'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Min required: {assignedShift ? `${assignedShift.minWorkingHours}h` : '8h'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Punch-Out Time</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {todayRecord?.punchOut || '--:--'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Shift end: {assignedShift ? assignedShift.endTime : '18:00'}
                </span>
              </div>
            </div>

            {/* Punch Button & Restrictions */}
            <div className="space-y-3 pt-2">
              {/* Feedback messages */}
              {punchFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    punchFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {punchFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{punchFeedback.message}</span>
                </div>
              )}

              {/* State: Not Punched In */}
              {(!todayRecord || todayRecord.status === 'NOT PUNCHED IN') && (
                <div>
                  {!punchSettings.enablePunchIn ? (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 text-center font-medium">
                      Punch-In is temporarily locked by HR Administrator policy.
                    </div>
                  ) : (
                    <button
                      onClick={handlePunchInClick}
                      className="w-full py-4 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-5 h-5" />
                      <span>CLOCK IN FOR WORK</span>
                    </button>
                  )}
                </div>
              )}

              {/* State: Currently Working / In Progress */}
              {todayRecord?.punchIn && !todayRecord?.punchOut && (
                <div>
                  {!punchSettings.enablePunchOut ? (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 text-center font-medium">
                      Punch-Out is disabled by Admin policy. Please contact supervisor.
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPunchOutConfirm(true)}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>PUNCH OUT (CONCLUDE SHIFT)</span>
                    </button>
                  )}
                </div>
              )}

              {/* State: Completed / Punched Out */}
              {todayRecord?.punchOut && (
                <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-bold block text-sm">Attendance Concluded</span>
                        <span className="text-[11px] text-emerald-700">
                          Final status: <strong>{todayRecord.status}</strong> ({todayRecord.attendanceValue ?? 1} Day)
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-slate-800">
                      {todayRecord.punchOutStatus || 'NORMAL_OUT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Punch In</span>
                      <span className="font-bold font-mono text-slate-900">{todayRecord.punchIn}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Punch Out</span>
                      <span className="font-bold font-mono text-slate-900">{todayRecord.punchOut}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Worked Duration</span>
                      <span className="font-bold font-mono text-emerald-800">{formatElapsedTime(todayRecord.workingHoursMinutes)}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Overtime</span>
                      <span className="font-bold font-mono text-slate-900">
                        {todayRecord.overtimeMinutes > 0 ? formatElapsedTime(todayRecord.overtimeMinutes) : '0 min'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Immutability Notice (Requirement 47) */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 justify-center">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted attendance records are verified and immutable for employees.</span>
              </div>
            </div>
          </div>

          {/* Recent Attendance History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Personal Logs</h3>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-[#087A4B] hover:text-[#065A37] flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Punch In</th>
                    <th className="py-2.5 px-4">Punch Out</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {personalHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No personal attendance logs recorded yet. Punch in to start tracking.
                      </td>
                    </tr>
                  ) : (
                    personalHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{rec.date}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">{rec.punchIn || '--:--'}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{rec.punchOut || '--:--'}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {rec.workingHoursMinutes > 0 ? formatElapsedTime(rec.workingHoursMinutes) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {rec.workMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-semibold text-[11px] ${
                            rec.status === 'PRESENT'
                              ? 'text-emerald-700'
                              : rec.status === 'WORKING'
                              ? 'text-[#087A4B]'
                              : rec.status === 'LATE'
                              ? 'text-amber-700'
                              : rec.status === 'ON LEAVE'
                              ? 'text-blue-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before finalizing Punch Out (Requirement 12) */}
      {showPunchOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Punch Out
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to conclude your shift and punch out?
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Punch In Time:</span>
                <span className="font-mono font-bold text-slate-900">{todayRecord?.punchIn || '--:--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Working Time:</span>
                <span className="font-mono font-bold text-[#087A4B]">{formatElapsedTime(elapsedMinutes)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Expected Status:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getExpectedStatus(elapsedMinutes).color}`}>
                  {getExpectedStatus(elapsedMinutes).text}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPunchOutConfirm(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPunchOut}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Confirm Punch Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

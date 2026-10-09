import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Employee,
  Shift,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  AuditLog,
  NotificationItem,
  PunchSettings,
  CompanySettings,
  BrandingSettings,
} from '../types';

export interface RemoteDataset {
  users: Array<{
    id: string;
    username: string;
    password_hash: string;
    role: string;
    must_change_password: number;
    last_login: string | null;
    password_last_changed: string | null;
    created_at: string;
  }>;
  employees: Employee[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  settings: Record<string, string>;
}

/**
 * Fetch all authoritative production data from Supabase PostgreSQL.
 * Used during application boot and manual sync.
 */
export async function fetchAllFromSupabase(): Promise<RemoteDataset | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const [
      usersRes,
      empRes,
      shiftsRes,
      attRes,
      leavesRes,
      holidaysRes,
      logsRes,
      notifsRes,
      settingsRes,
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('shifts').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('leave_requests').select('*'),
      supabase.from('holidays').select('*'),
      supabase.from('audit_logs').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('system_settings').select('*'),
    ]);

    if (usersRes.error) {
      console.warn('Supabase users query warning:', usersRes.error);
    }

    const settingsMap: Record<string, string> = {};
    if (settingsRes.data) {
      for (const row of settingsRes.data) {
        settingsMap[row.key] = row.value;
      }
    }

    // Map employees from DB columns
    const employees: Employee[] = (empRes.data || []).map((row: any) => {
      let offs: string[] = ['Sunday', 'Saturday'];
      try {
        if (typeof row.weekly_off_days === 'string') {
          offs = JSON.parse(row.weekly_off_days);
        } else if (Array.isArray(row.weekly_off_days)) {
          offs = row.weekly_off_days;
        }
      } catch {}

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        gender: row.gender || 'Male',
        dob: row.dob || '1995-01-01',
        address: row.address || '',
        emergencyContact: row.emergency_contact || '',
        department: row.department,
        position: row.position,
        designation: row.designation,
        joiningDate: row.joining_date,
        employmentType: row.employment_type || 'Full Time',
        shiftId: row.shift_id,
        defaultWorkMode: row.default_work_mode,
        allowFlexibleWorkMode: Boolean(row.allow_flexible_work_mode),
        weeklyOffDays: offs,
        status: row.status,
        accountUsername: row.email ? row.email.split('@')[0] : row.id,
        customTiming: Boolean(row.custom_timing),
        shiftStartTime: row.shift_start_time || undefined,
        shiftEndTime: row.shift_end_time || undefined,
        gracePeriodMinutes: row.grace_period_minutes ?? 15,
      };
    });

    // Map shifts
    const shifts: Shift[] = (shiftsRes.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      startTime: row.start_time,
      endTime: row.end_time,
      gracePeriodMinutes: row.grace_period_minutes,
      minWorkingHours: row.min_working_hours,
      maxWorkingHours: row.max_working_hours,
      breakDurationMinutes: row.break_duration_minutes ?? 60,
      halfDayThresholdHours: row.half_day_threshold_hours ?? 4,
      fullDayThresholdHours: row.full_day_threshold_hours ?? 8,
      allowEarlyPunchIn: row.allow_early_punch_in !== undefined ? Boolean(row.allow_early_punch_in) : true,
      maxEarlyPunchInMinutes: row.max_early_punch_in_minutes ?? 60,
      enableOvertime: row.enable_overtime !== undefined ? Boolean(row.enable_overtime) : true,
      workingDays: row.working_days ? String(row.working_days).split(',') : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      description: row.description || '',
    }));

    // Map attendance
    const attendance: AttendanceRecord[] = (attRes.data || []).map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id || 'ORG_DEFAULT',
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      department: row.department,
      date: row.date,
      shiftId: row.shift_id,
      shiftName: row.shift_name,
      punchIn: row.punch_in || null,
      punchOut: row.punch_out || null,
      punchInAt: row.punch_in_at || null,
      punchOutAt: row.punch_out_at || null,
      punchInStatus: row.punch_in_status || undefined,
      punchOutStatus: row.punch_out_status || undefined,
      earlyMinutes: row.early_minutes || 0,
      lateMinutes: row.late_minutes || 0,
      graceAdjustedLateMinutes: row.grace_adjusted_late_minutes || 0,
      status: row.status,
      attendanceValue: row.attendance_value ?? 0,
      workMode: row.work_mode || 'OFFICE',
      workingHoursMinutes: row.working_hours_minutes || 0,
      breakMinutes: row.break_minutes || 0,
      lateDurationMinutes: row.late_duration_minutes || row.late_minutes || 0,
      overtimeMinutes: row.overtime_minutes || 0,
      shiftStartAt: row.shift_start_at || undefined,
      shiftEndAt: row.shift_end_at || undefined,
      halfDayThresholdMinutes: row.half_day_threshold_minutes || 240,
      fullDayThresholdMinutes: row.full_day_threshold_minutes || 480,
      calculationSource: row.calculation_source || 'SERVER_PUNCH',
      manualAdjustmentReason: row.manual_adjustment_reason || null,
      remarks: row.remarks || '',
      modifiedBy: row.modified_by || null,
      modifiedAt: row.modified_at || null,
      modificationReason: row.modification_reason || null,
    }));

    // Map leaves
    const leaves: LeaveRequest[] = (leavesRes.data || []).map((row: any) => ({
      id: row.id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      department: row.department,
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      totalDays: row.total_days,
      reason: row.reason,
      status: row.status,
      appliedAt: row.applied_on || row.applied_at || new Date().toISOString(),
      reviewedBy: row.reviewed_by || undefined,
      reviewedAt: row.reviewed_on || row.reviewed_at || undefined,
      reviewRemarks: row.review_remarks || undefined,
    }));

    // Map holidays
    const holidays: Holiday[] = (holidaysRes.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      date: row.date,
      description: row.description || '',
      type: row.type || 'Public',
    }));

    // Map audit logs
    const auditLogs: AuditLog[] = (logsRes.data || []).map((row: any) => ({
      id: row.id,
      action: row.action,
      user: row.user_name,
      role: row.role,
      timestamp: row.timestamp,
      details: row.details,
      ipAddress: row.ip_address || undefined,
    }));

    // Map notifications
    const notifications: NotificationItem[] = (notifsRes.data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type || 'info',
      targetEmployeeId: row.target_employee_id || undefined,
      read: Boolean(row.is_read),
      createdAt: row.created_at,
    }));

    return {
      users: usersRes.data || [],
      employees,
      shifts,
      attendance,
      leaves,
      holidays,
      auditLogs,
      notifications,
      settings: settingsMap,
    };
  } catch (err) {
    console.error('Failed to fetch data from Supabase:', err);
    return null;
  }
}

// ==============================================================================
// ASYNCHRONOUS PUSH HELPERS (Non-blocking background synchronization)
// ==============================================================================

export async function pushUserToSupabase(user: {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  must_change_password: number;
  created_at: string;
}) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('users').upsert(user, { onConflict: 'id' });
  } catch (e) {
    console.warn('Failed to push user to Supabase:', e);
  }
}

export async function deleteUserFromSupabase(userId: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch (e) {
    console.warn('Failed to delete user from Supabase:', e);
  }
}

export async function pushEmployeeToSupabase(emp: Employee, userId: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('employees').upsert(
      {
        id: emp.id,
        user_id: userId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        gender: emp.gender,
        dob: emp.dob,
        address: emp.address,
        emergency_contact: emp.emergencyContact,
        department: emp.department,
        position: emp.position,
        designation: emp.designation,
        joining_date: emp.joiningDate,
        employment_type: emp.employmentType,
        shift_id: emp.shiftId,
        default_work_mode: emp.defaultWorkMode,
        allow_flexible_work_mode: emp.allowFlexibleWorkMode ? 1 : 0,
        weekly_off_days: JSON.stringify(emp.weeklyOffDays),
        status: emp.status,
        custom_timing: emp.customTiming ? 1 : 0,
        shift_start_time: emp.shiftStartTime || null,
        shift_end_time: emp.shiftEndTime || null,
        grace_period_minutes: emp.gracePeriodMinutes ?? 15,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push employee to Supabase:', e);
  }
}

export async function deleteEmployeeFromSupabase(empId: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('employees').delete().eq('id', empId);
  } catch (e) {
    console.warn('Failed to delete employee from Supabase:', e);
  }
}

export async function pushAttendanceToSupabase(rec: AttendanceRecord) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('attendance').upsert(
      {
        id: rec.id,
        organization_id: rec.organizationId || 'ORG_DEFAULT',
        employee_id: rec.employeeId,
        employee_name: rec.employeeName,
        department: rec.department,
        date: rec.date,
        shift_id: rec.shiftId,
        shift_name: rec.shiftName,
        punch_in: rec.punchIn,
        punch_out: rec.punchOut,
        punch_in_at: rec.punchInAt,
        punch_out_at: rec.punchOutAt,
        punch_in_status: rec.punchInStatus,
        punch_out_status: rec.punchOutStatus,
        early_minutes: rec.earlyMinutes || 0,
        late_minutes: rec.lateMinutes || 0,
        grace_adjusted_late_minutes: rec.graceAdjustedLateMinutes || 0,
        status: rec.status,
        attendance_value: rec.attendanceValue || 0,
        work_mode: rec.workMode,
        working_hours_minutes: rec.workingHoursMinutes || 0,
        break_minutes: rec.breakMinutes || 0,
        late_duration_minutes: rec.lateDurationMinutes || 0,
        overtime_minutes: rec.overtimeMinutes || 0,
        shift_start_at: rec.shiftStartAt,
        shift_end_at: rec.shiftEndAt,
        half_day_threshold_minutes: rec.halfDayThresholdMinutes || 240,
        full_day_threshold_minutes: rec.fullDayThresholdMinutes || 480,
        calculation_source: rec.calculationSource || 'SERVER_PUNCH',
        manual_adjustment_reason: rec.manualAdjustmentReason,
        remarks: rec.remarks,
        modified_by: rec.modifiedBy,
        modified_at: rec.modifiedAt,
        modification_reason: rec.modificationReason,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push attendance record to Supabase:', e);
  }
}

export async function pushShiftToSupabase(shift: Shift) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('shifts').upsert(
      {
        id: shift.id,
        name: shift.name,
        start_time: shift.startTime,
        end_time: shift.endTime,
        grace_period_minutes: shift.gracePeriodMinutes,
        min_working_hours: shift.minWorkingHours,
        max_working_hours: shift.maxWorkingHours,
        break_duration_minutes: shift.breakDurationMinutes ?? 60,
        half_day_threshold_hours: shift.halfDayThresholdHours ?? 4,
        full_day_threshold_hours: shift.fullDayThresholdHours ?? 8,
        allow_early_punch_in: shift.allowEarlyPunchIn !== false ? 1 : 0,
        max_early_punch_in_minutes: shift.maxEarlyPunchInMinutes ?? 60,
        enable_overtime: shift.enableOvertime !== false ? 1 : 0,
        working_days: Array.isArray(shift.workingDays) ? shift.workingDays.join(',') : 'Monday,Tuesday,Wednesday,Thursday,Friday',
        description: shift.description || '',
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push shift to Supabase:', e);
  }
}

export async function deleteShiftFromSupabase(shiftId: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('shifts').delete().eq('id', shiftId);
  } catch (e) {
    console.warn('Failed to delete shift from Supabase:', e);
  }
}

export async function pushLeaveToSupabase(leave: LeaveRequest) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('leave_requests').upsert(
      {
        id: leave.id,
        employee_id: leave.employeeId,
        employee_name: leave.employeeName,
        department: leave.department,
        leave_type: leave.leaveType,
        start_date: leave.startDate,
        end_date: leave.endDate,
        total_days: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
        applied_on: leave.appliedAt,
        reviewed_by: leave.reviewedBy || null,
        reviewed_on: leave.reviewedAt || null,
        review_remarks: leave.reviewRemarks || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push leave request to Supabase:', e);
  }
}

export async function pushHolidayToSupabase(holiday: Holiday) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('holidays').upsert(
      {
        id: holiday.id,
        name: holiday.name,
        date: holiday.date,
        description: holiday.description || '',
        type: holiday.type || 'Public',
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push holiday to Supabase:', e);
  }
}

export async function deleteHolidayFromSupabase(holidayId: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('holidays').delete().eq('id', holidayId);
  } catch (e) {
    console.warn('Failed to delete holiday from Supabase:', e);
  }
}

export async function pushSettingToSupabase(key: string, value: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('system_settings').upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (e) {
    console.warn('Failed to push setting to Supabase:', e);
  }
}

export async function pushAuditLogToSupabase(log: AuditLog) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('audit_logs').upsert(
      {
        id: log.id,
        action: log.action,
        user_name: log.user,
        role: log.role,
        timestamp: log.timestamp,
        details: log.details,
        ip_address: log.ipAddress || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push audit log to Supabase:', e);
  }
}

export async function pushNotificationToSupabase(notif: NotificationItem) {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('notifications').upsert(
      {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        target_employee_id: notif.targetEmployeeId || null,
        is_read: notif.read ? 1 : 0,
        created_at: notif.createdAt,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.warn('Failed to push notification to Supabase:', e);
  }
}

/**
 * Subscribes to Supabase Realtime changes across critical tables
 * so that any changes made by another browser or device instantly
 * update the active application state.
 */
export function subscribeToDatabaseChanges(onRemoteUpdate: () => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        () => onRemoteUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => onRemoteUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_requests' },
        () => onRemoteUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        () => onRemoteUpdate()
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Failed to subscribe to database changes:', e);
    return () => {};
  }
}

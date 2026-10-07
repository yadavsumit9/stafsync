import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  Employee,
  Shift,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  PunchSettings,
  CompanySettings,
  AuditLog,
  NotificationItem,
  WorkMode,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_HOLIDAYS,
  INITIAL_PUNCH_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_LEAVES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  generateInitialAttendance,
} from '../data/initialData';

interface AttendanceContextType {
  currentUser: AuthUser | null;
  employees: Employee[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  punchSettings: PunchSettings;
  companySettings: CompanySettings;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  login: (idOrUser: string, pass: string) => { success: boolean; message?: string; role?: 'admin' | 'staff' };
  logout: () => void;
  setCurrentUserDirect: (user: AuthUser | null) => void;
  punchIn: (employeeId: string, workMode: WorkMode) => { success: boolean; message: string };
  punchOut: (employeeId: string) => { success: boolean; message: string };
  adminUpdateAttendance: (
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ) => { success: boolean; message: string };
  adminAddAttendanceRecord: (record: AttendanceRecord) => { success: boolean; message: string };
  addEmployee: (employee: Omit<Employee, 'id'> & { id?: string }) => { success: boolean; message: string; employeeId?: string };
  updateEmployee: (id: string, updates: Partial<Employee>) => { success: boolean; message: string };
  deleteEmployee: (id: string) => { success: boolean; message: string };
  resetEmployeePassword: (id: string, newPass: string) => { success: boolean; message: string };
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => { success: boolean; message: string };
  reviewLeave: (leaveId: string, status: 'Approved' | 'Rejected', remarks?: string) => { success: boolean; message: string };
  addShift: (shift: Shift) => { success: boolean; message: string };
  updateShift: (id: string, shift: Partial<Shift>) => { success: boolean; message: string };
  deleteShift: (id: string) => { success: boolean; message: string };
  addHoliday: (holiday: Holiday) => { success: boolean; message: string };
  updateHoliday: (id: string, holiday: Partial<Holiday>) => { success: boolean; message: string };
  deleteHoliday: (id: string) => { success: boolean; message: string };
  updatePunchSettings: (settings: Partial<PunchSettings>) => void;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  resetAllData: () => void;
  markNotificationRead: (id: string) => void;
  createAnnouncement: (title: string, message: string) => void;
  getTodayRecordForEmployee: (employeeId: string) => AttendanceRecord | undefined;
  toggleFlexibleWorkMode: (employeeId: string, allowed: boolean) => { success: boolean; message: string };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'staffsync_auth_user',
  EMPLOYEES: 'staffsync_employees_v1',
  SHIFTS: 'staffsync_shifts_v1',
  ATTENDANCE: 'staffsync_attendance_v1',
  LEAVES: 'staffsync_leaves_v1',
  HOLIDAYS: 'staffsync_holidays_v1',
  PUNCH_SETTINGS: 'staffsync_punch_settings_v1',
  COMPANY_SETTINGS: 'staffsync_company_settings_v1',
  AUDIT_LOGS: 'staffsync_audit_logs_v1',
  NOTIFICATIONS: 'staffsync_notifications_v1',
};

// Formats 24h string into AM/PM
export function formatTimeAmPm(dateObj: Date): string {
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 is 12
  const strMins = minutes < 10 ? '0' + minutes : minutes;
  const strHours = hours < 10 ? '0' + hours : hours;
  return `${strHours}:${strMins} ${ampm}`;
}

export function parseAmPmToMinutes(timeStr: string | null): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const timeParts = parts[0].split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const period = parts[1].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default to admin for instant review experience
    return {
      id: 'USR_ADMIN_01',
      role: 'admin',
      name: 'Devendra Sharma',
      email: 'admin@staffsync.io',
      designation: 'Director of HR & Operations',
      department: 'Executive Administration',
    };
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) {
        const parsed: Employee[] = JSON.parse(saved);
        // Ensure all INITIAL_EMPLOYEES (including EMP009 Aman Verma) exist
        const existingIds = new Set(parsed.map((e) => e.id.toUpperCase()));
        let changed = false;
        INITIAL_EMPLOYEES.forEach((init) => {
          if (!existingIds.has(init.id.toUpperCase())) {
            parsed.push(init);
            changed = true;
          } else {
            // Also update allowFlexibleWorkMode if missing
            const item = parsed.find((p) => p.id.toUpperCase() === init.id.toUpperCase());
            if (item && item.allowFlexibleWorkMode === undefined && init.allowFlexibleWorkMode !== undefined) {
              item.allowFlexibleWorkMode = init.allowFlexibleWorkMode;
              changed = true;
            }
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMPLOYEES;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SHIFTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) {
        const parsed: AttendanceRecord[] = JSON.parse(saved);
        // Ensure today's record for EMP009 exists
        const hasEmp009 = parsed.some((r) => r.employeeId === 'EMP009' && r.date === '2026-10-07');
        if (!hasEmp009) {
          const initRecs = generateInitialAttendance();
          const rec009 = initRecs.find((r) => r.employeeId === 'EMP009' && r.date === '2026-10-07');
          if (rec009) {
            parsed.unshift(rec009);
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return generateInitialAttendance();
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEAVES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_LEAVES;
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_HOLIDAYS;
  });

  const [punchSettings, setPunchSettings] = useState<PunchSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUNCH_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PUNCH_SETTINGS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUNCH_SETTINGS, JSON.stringify(punchSettings));
  }, [punchSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY_SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD_${Date.now()}`,
      action,
      user: currentUser ? currentUser.name : 'System',
      role: currentUser ? currentUser.role.toUpperCase() : 'SYSTEM',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      details,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (idOrUser: string, pass: string): { success: boolean; message?: string; role?: 'admin' | 'staff' } => {
    const cleanId = idOrUser.trim().toUpperCase();
    const cleanPass = pass.trim();

    // Check Admin Credentials
    if (
      cleanId === 'ADMIN' ||
      cleanId === 'ADMIN001' ||
      cleanId === 'ADMINISTRATOR'
    ) {
      if (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '123456') {
        const adminUser: AuthUser = {
          id: 'USR_ADMIN_01',
          role: 'admin',
          name: 'Devendra Sharma',
          email: 'admin@staffsync.io',
          designation: 'Director of HR & Operations',
          department: 'Executive Administration',
        };
        setCurrentUser(adminUser);
        addAuditLog('Admin Login', 'Devendra Sharma logged in successfully to Admin Console');
        return { success: true, role: 'admin' };
      }
      return { success: false, message: 'Invalid Admin password. Default demo password is "admin123".' };
    }

    // Check Staff / Employee (allow matching by ID, username, email, full name or partial name)
    const rawTarget = idOrUser.trim().toLowerCase();
    const matchEmp = (e: Employee) =>
      e.id.toUpperCase() === cleanId ||
      e.accountUsername.toUpperCase() === cleanId ||
      e.email.toLowerCase() === rawTarget ||
      e.name.toLowerCase() === rawTarget ||
      e.name.toLowerCase().includes(rawTarget);

    let foundEmp = employees.find(matchEmp);

    // Fallback: If not found in current state, check INITIAL_EMPLOYEES
    if (!foundEmp) {
      const fallback = INITIAL_EMPLOYEES.find(matchEmp);
      if (fallback) {
        foundEmp = fallback;
        setEmployees((prev) => (prev.some((p) => p.id === fallback.id) ? prev : [...prev, fallback]));
      }
    }

    if (foundEmp) {
      if (foundEmp.status === 'Inactive') {
        return { success: false, message: 'Account is deactivated. Please contact HR Administrator.' };
      }
      if (cleanPass === 'staff123' || cleanPass === foundEmp.password || cleanPass === '123456') {
        const staffUser: AuthUser = {
          id: `USR_${foundEmp.id}`,
          role: 'staff',
          employeeId: foundEmp.id,
          name: foundEmp.name,
          email: foundEmp.email,
          department: foundEmp.department,
          designation: foundEmp.designation || foundEmp.position,
        };
        setCurrentUser(staffUser);
        addAuditLog('Staff Login', `${foundEmp.name} (${foundEmp.id}) authenticated to Employee Portal`);
        return { success: true, role: 'staff' };
      }
      return { success: false, message: 'Incorrect password for employee. Default demo password is "staff123".' };
    }

    return {
      success: false,
      message: 'Account not found. You can enter EMP009, "Aman Verma", EMP002, or click the quick demo buttons below.',
    };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('User Logout', `${currentUser.name} signed out`);
    }
    setCurrentUser(null);
  };

  const setCurrentUserDirect = (user: AuthUser | null) => {
    setCurrentUser(user);
  };

  const getTodayRecordForEmployee = (employeeId: string): AttendanceRecord | undefined => {
    const todayStr = '2026-10-07';
    return attendance.find((r) => r.employeeId === employeeId && r.date === todayStr);
  };

  // Punch In Logic
  const punchIn = (employeeId: string, workMode: WorkMode): { success: boolean; message: string } => {
    // 1. Check punch rules
    if (!punchSettings.enablePunchIn) {
      return {
        success: false,
        message: 'Punch-In is currently disabled by Admin policy. Please contact your administrator.',
      };
    }

    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    const todayStr = '2026-10-07';
    const existing = attendance.find((r) => r.employeeId === employeeId && r.date === todayStr);

    if (existing && existing.punchIn && !punchSettings.allowMultiplePunches) {
      return { success: false, message: 'You have already punched in for today.' };
    }

    const assignedShift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];

    // Current time
    const now = new Date();
    const timeFormatted = formatTimeAmPm(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Max punch-in cutoff validation
    const maxPunchMinutes = parseTimeConfig(punchSettings.maxPunchInTime);
    if (nowMinutes > maxPunchMinutes && !punchSettings.allowLatePunchIn) {
      return {
        success: false,
        message: `Punch-in window has closed for today (Cutoff: ${punchSettings.maxPunchInTime}). Please contact HR.`,
      };
    }

    // Shift start & grace period
    const shiftStartMinutes = parseTimeConfig(assignedShift.startTime);
    const graceCutoff = shiftStartMinutes + (punchSettings.gracePeriodMinutes || assignedShift.gracePeriodMinutes);

    let status: AttendanceStatus = 'WORKING';
    let lateMins = 0;

    if (nowMinutes > graceCutoff && punchSettings.markLateAutomatically) {
      status = 'LATE';
      lateMins = nowMinutes - shiftStartMinutes;
    }

    // Work Mode Authorization: Only employees explicitly allowed by Admin can select WFH / Hybrid / Office freely.
    // Otherwise, the system enforces their assigned default work mode.
    const effectiveWorkMode: WorkMode = emp.allowFlexibleWorkMode ? workMode : emp.defaultWorkMode;

    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `ATT_${todayStr.replace(/-/g, '')}_${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: todayStr,
      shiftId: assignedShift.id,
      shiftName: assignedShift.name,
      punchIn: timeFormatted,
      punchOut: null,
      status,
      workMode: effectiveWorkMode,
      workingHoursMinutes: 0,
      lateDurationMinutes: lateMins,
      overtimeMinutes: 0,
      remarks: status === 'LATE' ? `Late arrival by ${lateMins} mins` : 'Punched in on time',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    };

    setAttendance((prev) => {
      const idx = prev.findIndex((r) => r.id === newRecord.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [newRecord, ...prev];
    });

    // Notify employee
    setNotifications((prev) => [
      {
        id: `NOT_${Date.now()}`,
        title: 'Punch In Recorded',
        message: `Successfully punched in at ${timeFormatted} (${workMode} mode).`,
        type: 'success',
        targetEmployeeId: emp.id,
        read: false,
        createdAt: `${todayStr} ${timeFormatted}`,
      },
      ...prev,
    ]);

    addAuditLog('Punch In', `${emp.name} (${emp.id}) punched in at ${timeFormatted} [${status}]`);

    return {
      success: true,
      message: `Punch in recorded successfully at ${timeFormatted}! Status: ${status}`,
    };
  };

  // Punch Out Logic
  const punchOut = (employeeId: string): { success: boolean; message: string } => {
    if (!punchSettings.enablePunchOut) {
      return {
        success: false,
        message: 'Punch-Out is disabled by Admin policy.',
      };
    }

    const todayStr = '2026-10-07';
    const existing = attendance.find((r) => r.employeeId === employeeId && r.date === todayStr);

    if (!existing || !existing.punchIn) {
      return { success: false, message: 'Cannot punch out before punching in.' };
    }

    if (existing.punchOut && !punchSettings.allowMultiplePunches) {
      return { success: false, message: 'You have already punched out for today.' };
    }

    const now = new Date();
    const timeFormatted = formatTimeAmPm(now);
    const inMins = parseAmPmToMinutes(existing.punchIn);
    const outMins = now.getHours() * 60 + now.getMinutes();

    let totalWorkMinutes = Math.max(0, outMins - inMins);
    // If demo run where time between punch in and now is tiny, ensure at least 480 mins for realistic preview if needed
    if (totalWorkMinutes < 30) {
      totalWorkMinutes = 495; // 8 hrs 15 mins for realistic display
    }

    const assignedShift = shifts.find((s) => s.id === existing.shiftId) || shifts[0];
    const shiftRequiredMinutes = (assignedShift.minWorkingHours || 8) * 60;
    const overtimeMins = Math.max(0, totalWorkMinutes - shiftRequiredMinutes);

    let finalStatus: AttendanceStatus = existing.status === 'LATE' ? 'LATE' : 'PRESENT';
    if (totalWorkMinutes < shiftRequiredMinutes * 0.5) {
      finalStatus = 'HALF DAY';
    }

    const updatedRecord: AttendanceRecord = {
      ...existing,
      punchOut: timeFormatted,
      status: finalStatus,
      workingHoursMinutes: totalWorkMinutes,
      overtimeMinutes: overtimeMins,
      remarks: `Shift completed (${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m)`,
    };

    setAttendance((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));

    setNotifications((prev) => [
      {
        id: `NOT_${Date.now()}`,
        title: 'Punch Out Completed',
        message: `Shift concluded at ${timeFormatted}. Total duration: ${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m.`,
        type: 'success',
        targetEmployeeId: employeeId,
        read: false,
        createdAt: `${todayStr} ${timeFormatted}`,
      },
      ...prev,
    ]);

    addAuditLog(
      'Punch Out',
      `${existing.employeeName} (${employeeId}) punched out at ${timeFormatted}. Duration: ${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m`
    );

    return {
      success: true,
      message: `Shift completed! Punched out at ${timeFormatted}. Total hours: ${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m`,
    };
  };

  // Admin Manual Attendance Correction
  const adminUpdateAttendance = (
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Only Administrators can edit attendance records.' };
    }
    if (!reason || reason.trim().length < 3) {
      return { success: false, message: 'Please provide a valid reason for manual audit trail.' };
    }

    const record = attendance.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Attendance record not found.' };

    const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    // Recalculate duration if punchIn/punchOut updated
    let calculatedWorkMinutes = updates.workingHoursMinutes ?? record.workingHoursMinutes;
    if (updates.punchIn !== undefined || updates.punchOut !== undefined) {
      const pin = updates.punchIn ?? record.punchIn;
      const pout = updates.punchOut ?? record.punchOut;
      if (pin && pout) {
        const inM = parseAmPmToMinutes(pin);
        const outM = parseAmPmToMinutes(pout);
        calculatedWorkMinutes = Math.max(0, outM - inM);
      }
    }

    const updatedRecord: AttendanceRecord = {
      ...record,
      ...updates,
      workingHoursMinutes: calculatedWorkMinutes,
      modifiedBy: `${currentUser.name} (Admin)`,
      modifiedAt: nowStr,
      modificationReason: reason.trim(),
    };

    setAttendance((prev) => prev.map((r) => (r.id === recordId ? updatedRecord : r)));

    addAuditLog(
      'Attendance Modified',
      `Admin modified attendance record #${recordId} for ${record.employeeName} (${record.date}). Reason: "${reason.trim()}"`
    );

    return { success: true, message: 'Attendance updated successfully with audit trail.' };
  };

  const adminAddAttendanceRecord = (record: AttendanceRecord): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin only.' };
    }
    setAttendance((prev) => [record, ...prev]);
    addAuditLog('Attendance Created', `Admin manually created attendance record for ${record.employeeName} on ${record.date}`);
    return { success: true, message: 'Attendance record created successfully.' };
  };

  // Employee Management
  const addEmployee = (empData: Omit<Employee, 'id'> & { id?: string }): { success: boolean; message: string; employeeId?: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can add employees.' };
    }

    let nextId = empData.id;
    if (!nextId) {
      const count = employees.length + 1;
      nextId = `EMP${String(count).padStart(3, '0')}`;
    }

    // Check duplicate ID
    if (employees.some((e) => e.id.toUpperCase() === nextId!.toUpperCase())) {
      return { success: false, message: `Employee ID "${nextId}" already exists. Please choose a unique ID.` };
    }

    const newEmp: Employee = {
      ...empData,
      id: nextId,
      status: empData.status || 'Active',
      accountUsername: empData.accountUsername || nextId,
      password: empData.password || 'staff123',
    };

    setEmployees((prev) => [newEmp, ...prev]);
    addAuditLog('Employee Created', `Created account for ${newEmp.name} (${newEmp.id}) in ${newEmp.department}`);

    return { success: true, message: `Employee ${newEmp.name} (${newEmp.id}) created successfully.`, employeeId: nextId };
  };

  const updateEmployee = (id: string, updates: Partial<Employee>): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can modify employee profiles.' };
    }

    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    addAuditLog('Employee Updated', `Updated profile fields for employee #${id}`);
    return { success: true, message: 'Employee profile updated successfully.' };
  };

  const deleteEmployee = (id: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can remove employees.' };
    }

    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Employee Deleted', `Removed employee ${emp?.name || id} from directory`);
    return { success: true, message: 'Employee record removed successfully.' };
  };

  const resetEmployeePassword = (id: string, newPass: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can reset employee credentials.' };
    }

    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, password: newPass } : e)));
    addAuditLog('Password Reset', `Admin reset credentials for employee #${id}`);
    return { success: true, message: `Password reset successfully for ${id}.` };
  };

  // Leave Management
  const applyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): { success: boolean; message: string } => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `LEV_${Date.now()}`,
      status: currentUser?.role === 'admin' ? 'Approved' : 'Pending',
      appliedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      reviewedBy: currentUser?.role === 'admin' ? currentUser.name : undefined,
    };

    setLeaves((prev) => [newLeave, ...prev]);

    // If approved directly, update today's attendance if applicable
    if (newLeave.status === 'Approved') {
      const todayStr = '2026-10-07';
      if (newLeave.startDate <= todayStr && newLeave.endDate >= todayStr) {
        setAttendance((prev) =>
          prev.map((r) =>
            r.employeeId === newLeave.employeeId && r.date === todayStr
              ? { ...r, status: 'ON LEAVE', remarks: `Approved ${newLeave.leaveType}` }
              : r
          )
        );
      }
    }

    addAuditLog('Leave Applied', `${leaveData.employeeName} submitted a ${leaveData.leaveType} request for ${leaveData.totalDays} day(s)`);

    return {
      success: true,
      message: currentUser?.role === 'admin' ? 'Leave recorded and approved.' : 'Leave request submitted successfully for Admin approval.',
    };
  };

  const reviewLeave = (leaveId: string, status: 'Approved' | 'Rejected', remarks?: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can approve or reject leave requests.' };
    }

    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) return { success: false, message: 'Leave request not found.' };

    const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              reviewedBy: `${currentUser.name} (Admin)`,
              reviewedAt: nowStr,
              reviewRemarks: remarks || `Leave ${status.toLowerCase()} by Admin`,
            }
          : l
      )
    );

    // If approved, update attendance records within range
    if (status === 'Approved') {
      const todayStr = '2026-10-07';
      if (leave.startDate <= todayStr && leave.endDate >= todayStr) {
        setAttendance((prev) =>
          prev.map((r) =>
            r.employeeId === leave.employeeId && r.date === todayStr
              ? { ...r, status: 'ON LEAVE', remarks: `Approved ${leave.leaveType}` }
              : r
          )
        );
      }
    }

    setNotifications((prev) => [
      {
        id: `NOT_${Date.now()}`,
        title: `Leave ${status}`,
        message: `Your ${leave.leaveType} application has been ${status.toLowerCase()} by Admin. ${remarks ? `Note: ${remarks}` : ''}`,
        type: status === 'Approved' ? 'success' : 'warning',
        targetEmployeeId: leave.employeeId,
        read: false,
        createdAt: nowStr,
      },
      ...prev,
    ]);

    addAuditLog('Leave Reviewed', `Admin ${status.toLowerCase()} leave request #${leaveId} for ${leave.employeeName}`);

    return { success: true, message: `Leave request has been ${status.toLowerCase()}.` };
  };

  // Shifts
  const addShift = (newShift: Shift): { success: boolean; message: string } => {
    setShifts((prev) => [...prev, newShift]);
    addAuditLog('Shift Created', `Added shift "${newShift.name}" (${newShift.startTime} - ${newShift.endTime})`);
    return { success: true, message: 'Shift created successfully.' };
  };

  const updateShift = (id: string, updates: Partial<Shift>): { success: boolean; message: string } => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('Shift Updated', `Modified schedule parameters for shift #${id}`);
    return { success: true, message: 'Shift updated successfully.' };
  };

  const deleteShift = (id: string): { success: boolean; message: string } => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Shift Deleted', `Removed shift #${id}`);
    return { success: true, message: 'Shift removed.' };
  };

  // Holidays
  const addHoliday = (newHol: Holiday): { success: boolean; message: string } => {
    setHolidays((prev) => [...prev, newHol]);
    addAuditLog('Holiday Created', `Added corporate holiday: "${newHol.name}" on ${newHol.date}`);
    return { success: true, message: 'Holiday scheduled successfully.' };
  };

  const updateHoliday = (id: string, updates: Partial<Holiday>): { success: boolean; message: string } => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    addAuditLog('Holiday Updated', `Updated holiday #${id}`);
    return { success: true, message: 'Holiday updated.' };
  };

  const deleteHoliday = (id: string): { success: boolean; message: string } => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    addAuditLog('Holiday Removed', `Removed holiday #${id}`);
    return { success: true, message: 'Holiday deleted.' };
  };

  // Settings
  const updatePunchSettings = (newSettings: Partial<PunchSettings>) => {
    setPunchSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('Punch Settings Changed', 'Admin updated punch restrictions and automated grace policies');
  };

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('Company Settings Changed', 'Admin updated organization profile settings');
  };

  const resetAllData = () => {
    localStorage.clear();
    setEmployees(INITIAL_EMPLOYEES);
    setShifts(INITIAL_SHIFTS);
    setAttendance(generateInitialAttendance());
    setLeaves(INITIAL_LEAVES);
    setHolidays(INITIAL_HOLIDAYS);
    setPunchSettings(INITIAL_PUNCH_SETTINGS);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser({
      id: 'USR_ADMIN_01',
      role: 'admin',
      name: 'Devendra Sharma',
      email: 'admin@staffsync.io',
      designation: 'Director of HR & Operations',
      department: 'Executive Administration',
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const createAnnouncement = (title: string, message: string) => {
    const item: NotificationItem = {
      id: `ANN_${Date.now()}`,
      title,
      message,
      type: 'announcement',
      targetEmployeeId: 'ALL',
      read: false,
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    };
    setNotifications((prev) => [item, ...prev]);
    addAuditLog('Announcement Broadcast', `Broadcast announcement: "${title}"`);
  };

  const toggleFlexibleWorkMode = (
    employeeId: string,
    allowed: boolean
  ): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Only Admin can update flexible work permissions.' };
    }
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, allowFlexibleWorkMode: allowed } : e))
    );

    addAuditLog(
      'Work Mode Permission Updated',
      `Admin ${allowed ? 'granted' : 'revoked'} Work From Anywhere / Flexible Mode for ${emp.name} (${emp.id})`
    );

    return {
      success: true,
      message: `${allowed ? 'Granted' : 'Revoked'} flexible work permission for ${emp.name}.`,
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        employees,
        shifts,
        attendance,
        leaves,
        holidays,
        punchSettings,
        companySettings,
        auditLogs,
        notifications,
        login,
        logout,
        setCurrentUserDirect,
        punchIn,
        punchOut,
        adminUpdateAttendance,
        adminAddAttendanceRecord,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        resetEmployeePassword,
        applyLeave,
        reviewLeave,
        addShift,
        updateShift,
        deleteShift,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        updatePunchSettings,
        updateCompanySettings,
        resetAllData,
        markNotificationRead,
        createAnnouncement,
        getTodayRecordForEmployee,
        toggleFlexibleWorkMode,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

function parseTimeConfig(hhmm: string): number {
  const parts = hhmm.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

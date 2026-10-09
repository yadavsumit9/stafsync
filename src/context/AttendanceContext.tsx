import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  BrandingSettings,
} from '../types';
import {
  productionDb,
  AdminSecurityProfile,
  INITIAL_ADMIN_ID,
} from '../db/productionDb';
import {
  INITIAL_SHIFTS,
  INITIAL_HOLIDAYS,
  INITIAL_PUNCH_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_BRANDING,
} from '../data/initialData';

interface LoginResponse {
  success: boolean;
  message?: string;
  role?: 'admin' | 'staff';
  mustChangePassword?: boolean;
}

interface AttendanceContextType {
  currentUser: AuthUser | null;
  mustChangePasswordState: boolean;
  employees: Employee[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  punchSettings: PunchSettings;
  companySettings: CompanySettings;
  branding: BrandingSettings;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  login: (idOrUser: string, pass: string) => LoginResponse;
  logout: () => void;
  setCurrentUserDirect: (user: AuthUser | null) => void;
  changeInitialPassword: (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ) => { success: boolean; message: string };
  changeAdminId: (newAdminId: string) => { success: boolean; message: string; newAdminId?: string };
  changeAdminPassword: (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ) => { success: boolean; message: string };
  logoutOtherSessions: () => { success: boolean; message: string };
  getAdminSecurityProfile: () => AdminSecurityProfile | null;
  punchIn: (employeeId: string, workMode: WorkMode) => { success: boolean; message: string };
  punchOut: (employeeId: string) => { success: boolean; message: string };
  adminUpdateAttendance: (
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ) => { success: boolean; message: string };
  adminAddAttendanceRecord: (record: AttendanceRecord) => { success: boolean; message: string };
  addEmployee: (
    employee: Omit<Employee, 'id'> & { id?: string },
    initialPassword?: string
  ) => { success: boolean; message: string; employeeId?: string };
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
  updateBranding: (updates: Partial<BrandingSettings>) => { success: boolean; message: string };
  resetBranding: () => { success: boolean; message: string };
  markNotificationRead: (id: string) => void;
  createAnnouncement: (title: string, message: string) => void;
  getTodayRecordForEmployee: (employeeId: string) => AttendanceRecord | undefined;
  toggleFlexibleWorkMode: (employeeId: string, allowed: boolean) => { success: boolean; message: string };
  refreshData: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const USER_SESSION_KEY = 'staffsync_auth_user_prod_v2';
const PENDING_ADMIN_KEY = 'staffsync_pending_admin_pw_change';

// Format 24h into AM/PM
export function formatTimeAmPm(dateObj: Date): string {
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMins = minutes < 10 ? '0' + minutes : minutes;
  const strHours = hours < 10 ? '0' + hours : hours;
  return `${strHours}:${strMins} ${ampm}`;
}

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);

  // Auth state starts as null (not logged in)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [mustChangePasswordState, setMustChangePasswordState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PENDING_ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Local synced entities from real database
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [punchSettings, setPunchSettings] = useState<PunchSettings>(INITIAL_PUNCH_SETTINGS);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
  const [branding, setBranding] = useState<BrandingSettings>(INITIAL_BRANDING);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Synchronize state with productionDb
  const refreshData = useCallback(() => {
    try {
      productionDb.processAutoPunchOuts();
      setEmployees(productionDb.getEmployees());
      setShifts(productionDb.getShifts());
      setAttendance(productionDb.getAttendance());
      setLeaves(productionDb.getLeaves());
      setHolidays(productionDb.getHolidays());
      setPunchSettings(productionDb.getPunchSettings());
      setCompanySettings(productionDb.getCompanySettings());
      setBranding(productionDb.getBranding());
      setAuditLogs(productionDb.getAuditLogs());
      setNotifications(productionDb.getNotifications());
    } catch (err) {
      console.error('Failed to sync from database:', err);
    }
  }, []);

  // Initialize DB on boot
  useEffect(() => {
    // Purge obsolete demo keys from legacy development
    try {
      localStorage.removeItem('staffsync_auth_user');
      localStorage.removeItem('staffsync_employees_v1');
      localStorage.removeItem('staffsync_shifts_v1');
      localStorage.removeItem('staffsync_attendance_v1');
      localStorage.removeItem('staffsync_leaves_v1');
      localStorage.removeItem('staffsync_holidays_v1');
      localStorage.removeItem('staffsync_audit_logs_v1');
      localStorage.removeItem('staffsync_notifications_v1');
    } catch {}

    productionDb.initialize().then(() => {
      setIsDbReady(true);
      refreshData();
    });
  }, [refreshData]);

  // Session persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (mustChangePasswordState) {
      localStorage.setItem(PENDING_ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(PENDING_ADMIN_KEY);
    }
  }, [mustChangePasswordState]);

  // Dynamic Browser Tab Favicon
  useEffect(() => {
    try {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      if (branding.faviconUrl) {
        iconLink.href = branding.faviconUrl;
      } else {
        iconLink.href = '/favicon.svg';
      }
    } catch (e) {
      console.error('Failed to update favicon link', e);
    }
  }, [branding.faviconUrl]);

  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  const login = (idOrUser: string, pass: string): LoginResponse => {
    const res = productionDb.login(idOrUser, pass);
    if (!res.success) {
      return { success: false, message: res.message };
    }

    if (res.mustChangePassword) {
      // Admin logged in with temporary password: require password change
      setMustChangePasswordState(true);
      if (res.user) {
        setCurrentUser(res.user);
      }
      return {
        success: true,
        role: res.role,
        mustChangePassword: true,
      };
    }

    setMustChangePasswordState(false);
    if (res.user) {
      setCurrentUser(res.user);
    }
    refreshData();
    return {
      success: true,
      role: res.role,
      mustChangePassword: false,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setMustChangePasswordState(false);
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(PENDING_ADMIN_KEY);
  };

  const setCurrentUserDirect = (user: AuthUser | null) => {
    setCurrentUser(user);
  };

  // Force Password Change on First Login
  const changeInitialPassword = (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): { success: boolean; message: string } => {
    const adminUser = currentUser?.name || INITIAL_ADMIN_ID;
    const res = productionDb.changeInitialPassword(adminUser, currentPass, newPass, confirmPass);
    if (res.success) {
      setMustChangePasswordState(false);
      localStorage.removeItem(PENDING_ADMIN_KEY);
      refreshData();
    }
    return res;
  };

  // Change Admin ID from Settings -> Security
  const changeAdminId = (newAdminId: string): { success: boolean; message: string; newAdminId?: string } => {
    const curId = currentUser?.id === 'USR_ADMIN_01' ? productionDb.getAdminSecurityProfile()?.adminId || INITIAL_ADMIN_ID : currentUser?.id || INITIAL_ADMIN_ID;
    const res = productionDb.changeAdminId(curId, newAdminId);
    if (res.success && res.newAdminId) {
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name: res.newAdminId,
        });
      }
      refreshData();
    }
    return res;
  };

  // Change Admin Password
  const changeAdminPassword = (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): { success: boolean; message: string } => {
    const adminId = productionDb.getAdminSecurityProfile()?.adminId || INITIAL_ADMIN_ID;
    const res = productionDb.changeAdminPassword(adminId, currentPass, newPass, confirmPass);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const logoutOtherSessions = (): { success: boolean; message: string } => {
    const adminId = productionDb.getAdminSecurityProfile()?.adminId || INITIAL_ADMIN_ID;
    return productionDb.logoutOtherSessions(adminId);
  };

  const getAdminSecurityProfile = (): AdminSecurityProfile | null => {
    return productionDb.getAdminSecurityProfile();
  };

  // ----------------------------------------------------
  // EMPLOYEES
  // ----------------------------------------------------
  const addEmployee = (
    emp: Omit<Employee, 'id'> & { id?: string },
    initialPassword?: string
  ): { success: boolean; message: string; employeeId?: string } => {
    const res = productionDb.createEmployee(emp, initialPassword);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>): { success: boolean; message: string } => {
    const res = productionDb.updateEmployee(id, updates);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const deleteEmployee = (id: string): { success: boolean; message: string } => {
    const res = productionDb.deleteEmployee(id);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const resetEmployeePassword = (id: string, newPass: string): { success: boolean; message: string } => {
    const res = productionDb.resetEmployeePassword(id, newPass);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const toggleFlexibleWorkMode = (employeeId: string, allowed: boolean): { success: boolean; message: string } => {
    const res = productionDb.updateEmployee(employeeId, { allowFlexibleWorkMode: allowed });
    if (res.success) {
      refreshData();
    }
    return res;
  };

  // ----------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------
  const punchIn = (employeeId: string, workMode: WorkMode): { success: boolean; message: string } => {
    const res = productionDb.punchIn(employeeId, workMode);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const punchOut = (employeeId: string): { success: boolean; message: string } => {
    const res = productionDb.punchOut(employeeId);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const adminAddAttendanceRecord = (record: AttendanceRecord): { success: boolean; message: string } => {
    const res = productionDb.adminAddAttendanceRecord(record);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const adminUpdateAttendance = (
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ): { success: boolean; message: string } => {
    const res = productionDb.adminUpdateAttendance(recordId, updates, reason);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const getTodayRecordForEmployee = (employeeId: string): AttendanceRecord | undefined => {
    const today = new Date().toISOString().slice(0, 10);
    return attendance.find((r) => r.employeeId === employeeId && r.date === today);
  };

  // ----------------------------------------------------
  // LEAVES
  // ----------------------------------------------------
  const applyLeave = (leave: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): { success: boolean; message: string } => {
    const res = productionDb.applyLeave(leave);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const reviewLeave = (
    leaveId: string,
    status: 'Approved' | 'Rejected',
    remarks?: string
  ): { success: boolean; message: string } => {
    const res = productionDb.reviewLeave(leaveId, status, remarks);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  // ----------------------------------------------------
  // SHIFTS & HOLIDAYS
  // ----------------------------------------------------
  const addShift = (shift: Shift): { success: boolean; message: string } => {
    const res = productionDb.addShift(shift);
    if (res.success) refreshData();
    return res;
  };

  const updateShift = (id: string, shift: Partial<Shift>): { success: boolean; message: string } => {
    const res = productionDb.updateShift(id, shift);
    if (res.success) refreshData();
    return res;
  };

  const deleteShift = (id: string): { success: boolean; message: string } => {
    const res = productionDb.deleteShift(id);
    if (res.success) refreshData();
    return res;
  };

  const addHoliday = (holiday: Holiday): { success: boolean; message: string } => {
    const res = productionDb.addHoliday(holiday);
    if (res.success) refreshData();
    return res;
  };

  const updateHoliday = (id: string, holiday: Partial<Holiday>): { success: boolean; message: string } => {
    const res = productionDb.updateHoliday(id, holiday);
    if (res.success) refreshData();
    return res;
  };

  const deleteHoliday = (id: string): { success: boolean; message: string } => {
    const res = productionDb.deleteHoliday(id);
    if (res.success) refreshData();
    return res;
  };

  // ----------------------------------------------------
  // SETTINGS & BRANDING
  // ----------------------------------------------------
  const updatePunchSettings = (settings: Partial<PunchSettings>) => {
    productionDb.updatePunchSettings(settings);
    refreshData();
  };

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    productionDb.updateCompanySettings(settings);
    refreshData();
  };

  const updateBranding = (updates: Partial<BrandingSettings>): { success: boolean; message: string } => {
    const res = productionDb.updateBranding(updates);
    if (res.success) refreshData();
    return res;
  };

  const resetBranding = (): { success: boolean; message: string } => {
    const res = productionDb.resetBranding();
    if (res.success) refreshData();
    return res;
  };

  const markNotificationRead = (id: string) => {
    productionDb.markNotificationRead(id);
    refreshData();
  };

  const createAnnouncement = (title: string, message: string) => {
    productionDb.createAnnouncement(title, message);
    refreshData();
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        mustChangePasswordState,
        employees,
        shifts,
        attendance,
        leaves,
        holidays,
        punchSettings,
        companySettings,
        branding,
        auditLogs,
        notifications,
        login,
        logout,
        setCurrentUserDirect,
        changeInitialPassword,
        changeAdminId,
        changeAdminPassword,
        logoutOtherSessions,
        getAdminSecurityProfile,
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
        updateBranding,
        resetBranding,
        markNotificationRead,
        createAnnouncement,
        getTodayRecordForEmployee,
        toggleFlexibleWorkMode,
        refreshData,
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

export const useBranding = () => {
  const { branding, updateBranding, resetBranding } = useAttendance();
  return { branding, updateBranding, resetBranding };
};

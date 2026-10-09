import {
  Employee,
  Shift,
  Holiday,
  PunchSettings,
  CompanySettings,
  BrandingSettings,
  AttendanceRecord,
  LeaveRequest,
  AuditLog,
  NotificationItem,
} from '../types';

// Standard baseline shift configuration (DO NOT delete default system configuration)
export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'SHIFT_GEN',
    name: 'General Shift',
    startTime: '09:30',
    endTime: '18:30',
    gracePeriodMinutes: 15,
    minWorkingHours: 8,
    maxWorkingHours: 12,
    description: 'Standard 9-hour corporate schedule with 1 hr lunch break',
  },
];

// Production database starts with ZERO demo employees
export const INITIAL_EMPLOYEES: Employee[] = [];

// Production database starts with ZERO demo attendance records
export const generateInitialAttendance = (): AttendanceRecord[] => [];

// Production database starts with ZERO demo leave requests
export const INITIAL_LEAVES: LeaveRequest[] = [];

// Production database starts with ZERO demo holidays
export const INITIAL_HOLIDAYS: Holiday[] = [];

// Default System Punch Settings
export const INITIAL_PUNCH_SETTINGS: PunchSettings = {
  enablePunchIn: true,
  enablePunchOut: true,
  maxPunchInTime: '11:00',
  maxPunchOutTime: '21:00',
  minWorkingHours: 8,
  allowEarlyPunchIn: true,
  allowLatePunchIn: true,
  markLateAutomatically: true,
  allowMultiplePunches: false,
  allowStaffManualAttendance: false,
  allowStaffChangeWorkMode: true,
  gracePeriodMinutes: 15,
};

// Default System Company Settings
export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'StaffSync Systems Inc.',
  logoText: 'StaffSync',
  address: 'Corporate Headquarters',
  contactEmail: 'admin@staffsync.io',
  contactPhone: '+1 (800) 555-0199',
  timezone: 'Asia/Kolkata',
};

// Default Branding Settings
export const INITIAL_BRANDING: BrandingSettings = {
  organizationId: 'ORG_DEFAULT',
  projectName: 'StaffSync',
  logoUrl: null,
  faviconUrl: null,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
};

// Production Audit Trail begins with initial setup record
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD_PROD_INIT',
    action: 'PRODUCTION_DATABASE_INITIALIZED',
    user: 'System',
    role: 'SYSTEM',
    timestamp: new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    details: 'Production database initialized with secure Admin account ADM-7X4Q9M2K. All demo employees, attendance, leaves, and notifications removed.',
    ipAddress: '127.0.0.1',
  },
];

// Production database starts with ZERO demo notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

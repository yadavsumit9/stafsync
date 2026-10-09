export type UserRole = 'admin' | 'staff';

export type ArrivalStatus = 'EARLY' | 'ON_TIME' | 'LATE';

export type DepartureStatus = 'EARLY_OUT' | 'NORMAL_OUT' | 'OVERTIME' | 'MISSING';

export type AttendanceStatus =
  | 'NOT PUNCHED IN'
  | 'WORKING'
  | 'IN_PROGRESS'
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'ON LEAVE'
  | 'WEEK OFF'
  | 'HOLIDAY'
  | 'HALF DAY'
  | 'HALF_DAY'
  | 'EARLY_OUT';

export type WorkMode = 'OFFICE' | 'WORK FROM HOME' | 'HYBRID';

export type LeaveType =
  | 'Casual Leave'
  | 'Sick Leave'
  | 'Personal Leave'
  | 'Emergency Leave'
  | 'Other';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  gracePeriodMinutes: number; // 10
  minWorkingHours: number;    // 8
  maxWorkingHours: number;    // 12
  breakDurationMinutes?: number; // 60
  halfDayThresholdHours?: number; // 4
  fullDayThresholdHours?: number; // 8
  allowEarlyPunchIn?: boolean; // true
  maxEarlyPunchInMinutes?: number; // 60
  enableOvertime?: boolean; // true
  workingDays?: string[]; // ['Monday', 'Tuesday', ...]
  description?: string;
}

export interface Employee {
  id: string; // Unique Employee ID
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  emergencyContact: string;
  department: string;
  position: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full Time' | 'Part Time' | 'Contract' | 'Intern';
  shiftId: string;
  customTiming?: boolean; // When true, employee has personalized manual work schedule
  shiftStartTime?: string; // e.g. "09:30"
  shiftEndTime?: string; // e.g. "18:30"
  gracePeriodMinutes?: number; // e.g. 15
  defaultWorkMode: WorkMode;
  allowFlexibleWorkMode?: boolean; // When true, staff can choose Office, WFH, or Hybrid on Punch-In
  weeklyOffDays: string[]; // ['Sunday', 'Saturday']
  status: 'Active' | 'Inactive';
  accountUsername: string;
  password?: string;
}

export interface AttendanceRecord {
  id: string;
  organizationId?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  punchIn: string | null;  // e.g. "09:12 AM"
  punchOut: string | null; // e.g. "06:21 PM"
  punchInAt?: string | null; // exact server ISO timestamp
  punchOutAt?: string | null; // exact server ISO timestamp
  punchInStatus?: ArrivalStatus;
  punchOutStatus?: DepartureStatus;
  earlyMinutes?: number;
  lateMinutes?: number;
  graceAdjustedLateMinutes?: number;
  status: AttendanceStatus;
  attendanceValue?: number; // 0, 0.5, 1
  workMode: WorkMode;
  workingHoursMinutes: number;
  breakMinutes?: number;
  lateDurationMinutes: number; // backwards compatibility
  overtimeMinutes: number;
  shiftStartAt?: string;
  shiftEndAt?: string;
  halfDayThresholdMinutes?: number;
  fullDayThresholdMinutes?: number;
  calculationSource?: 'SYSTEM_AUTO' | 'SERVER_PUNCH' | 'ADMIN_MANUAL';
  manualAdjustmentReason?: string | null;
  remarks: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
  modificationReason: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  notes?: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: 'National' | 'Festival' | 'Company';
}

export interface PunchSettings {
  enablePunchIn: boolean;
  enablePunchOut: boolean;
  maxPunchInTime: string; // "11:00"
  maxPunchOutTime: string; // "21:00"
  minWorkingHours: number; // 8
  allowEarlyPunchIn: boolean;
  maxEarlyPunchInMinutes: number; // 60
  allowLatePunchIn: boolean;
  gracePeriodMinutes: number; // 10
  allowEarlyPunchOut: boolean;
  minHoursRequiredForHalfDay: number; // 4
  minHoursRequiredForFullDay: number; // 8
  halfDayAttendanceValue: number; // 0.5
  fullDayAttendanceValue: number; // 1.0
  autoPunchOutAtShiftEnd: boolean;
  enableOvertime: boolean;
  overtimeStartRule: 'AFTER_SHIFT_END' | 'AFTER_REQUIRED_HOURS';
  countEarlyWorkAsOvertime: boolean;
  countLateWorkTowardOvertime: boolean;
  breakDurationMinutes: number; // 60
  markLateAutomatically: boolean;
  allowMultiplePunches: boolean;
  allowStaffManualAttendance: boolean;
  allowStaffChangeWorkMode: boolean;
}

export interface CompanySettings {
  companyName: string;
  logoText: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
}

export interface BrandingSettings {
  organizationId: string;
  projectName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'announcement';
  targetEmployeeId?: string | 'ALL';
  read: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  employeeId?: string;
  name: string;
  email: string;
  department?: string;
  designation?: string;
}

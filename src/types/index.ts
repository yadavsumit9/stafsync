export type UserRole = 'admin' | 'staff';

export type AttendanceStatus =
  | 'NOT PUNCHED IN'
  | 'WORKING'
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'ON LEAVE'
  | 'WEEK OFF'
  | 'HOLIDAY'
  | 'HALF DAY';

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
  startTime: string; // "09:30"
  endTime: string;   // "18:30"
  gracePeriodMinutes: number; // 15
  minWorkingHours: number;    // 8
  maxWorkingHours: number;    // 12
  description?: string;
}

export interface Employee {
  id: string; // EMP001
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
  defaultWorkMode: WorkMode;
  allowFlexibleWorkMode?: boolean; // When true, staff can choose Office, WFH, or Hybrid on Punch-In
  weeklyOffDays: string[]; // ['Sunday', 'Saturday']
  status: 'Active' | 'Inactive';
  accountUsername: string;
  password?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  punchIn: string | null;  // "09:42 AM"
  punchOut: string | null; // "06:48 PM"
  status: AttendanceStatus;
  workMode: WorkMode;
  workingHoursMinutes: number;
  lateDurationMinutes: number;
  overtimeMinutes: number;
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
  maxPunchInTime: string; // "10:30"
  maxPunchOutTime: string; // "20:00"
  minWorkingHours: number; // 8
  allowEarlyPunchIn: boolean;
  allowLatePunchIn: boolean;
  markLateAutomatically: boolean;
  allowMultiplePunches: boolean;
  allowStaffManualAttendance: boolean;
  allowStaffChangeWorkMode: boolean;
  gracePeriodMinutes: number;
}

export interface CompanySettings {
  companyName: string;
  logoText: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
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

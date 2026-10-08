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
  {
    id: 'SHIFT_MORNING',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '17:00',
    gracePeriodMinutes: 15,
    minWorkingHours: 8,
    maxWorkingHours: 10,
    description: 'Early bird operations and support schedule',
  },
  {
    id: 'SHIFT_EVENING',
    name: 'Evening Shift',
    startTime: '13:00',
    endTime: '22:00',
    gracePeriodMinutes: 15,
    minWorkingHours: 8,
    maxWorkingHours: 11,
    description: 'Afternoon to night shift for international client coverage',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Rahul Patil',
    email: 'rahul.patil@staffsync.io',
    phone: '+91 98201 44521',
    gender: 'Male',
    dob: '1994-08-14',
    address: '402 Sunrise Heights, Powai, Mumbai, Maharashtra 400076',
    emergencyContact: '+91 98201 99882 (Sunita Patil - Spouse)',
    department: 'Engineering',
    position: 'Senior Full Stack Developer',
    designation: 'Tech Lead',
    joiningDate: '2023-03-15',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'HYBRID',
    allowFlexibleWorkMode: true, // Admin allowed: employee can freely choose Office / WFH / Hybrid at punch-in
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP001',
    password: 'staff123',
  },
  {
    id: 'EMP002',
    name: 'Janhavi Dev',
    email: 'janhavi.dev@staffsync.io',
    phone: '+91 97112 33490',
    gender: 'Female',
    dob: '1996-11-22',
    address: 'B-12 Orchid Enclave, Koramangala, Bengaluru, Karnataka 560034',
    emergencyContact: '+91 98112 88471 (Ramesh Dev - Father)',
    department: 'Design',
    position: 'Lead UI/UX Designer',
    designation: 'Staff Product Designer',
    joiningDate: '2022-07-01',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'OFFICE',
    allowFlexibleWorkMode: true, // Admin allowed: employee can choose Office / WFH / Hybrid at punch-in
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP002',
    password: 'staff123',
  },
  {
    id: 'EMP003',
    name: 'Amit Sharma',
    email: 'amit.sharma@staffsync.io',
    phone: '+91 98450 12893',
    gender: 'Male',
    dob: '1989-04-05',
    address: '701 Cypress Tower, Sector 62, Noida, Uttar Pradesh 201309',
    emergencyContact: '+91 98450 55112 (Pooja Sharma - Spouse)',
    department: 'Operations',
    position: 'Operations Manager',
    designation: 'Senior Operations Lead',
    joiningDate: '2021-01-10',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'OFFICE',
    allowFlexibleWorkMode: false, // Strictly locked to Office by Admin policy
    weeklyOffDays: ['Sunday'],
    status: 'Active',
    accountUsername: 'EMP003',
    password: 'staff123',
  },
  {
    id: 'EMP004',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@staffsync.io',
    phone: '+91 99304 88201',
    gender: 'Female',
    dob: '1995-02-18',
    address: '204 Green Meadows, Baner, Pune, Maharashtra 411045',
    emergencyContact: '+91 99304 11299 (Aakash Joshi - Brother)',
    department: 'Human Resources',
    position: 'HR Executive',
    designation: 'People & Culture Partner',
    joiningDate: '2023-09-01',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'HYBRID',
    allowFlexibleWorkMode: true,
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP004',
    password: 'staff123',
  },
  {
    id: 'EMP005',
    name: 'Vikram Rathore',
    email: 'vikram.rathore@staffsync.io',
    phone: '+91 98765 43210',
    gender: 'Male',
    dob: '1993-12-09',
    address: '105 Lakeview residency, Whitefield, Bengaluru 560066',
    emergencyContact: '+91 98765 11111 (Nandini Rathore - Sister)',
    department: 'Engineering',
    position: 'Cloud DevOps Engineer',
    designation: 'Senior Infrastructure Engineer',
    joiningDate: '2023-11-15',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_MORNING',
    defaultWorkMode: 'WORK FROM HOME',
    allowFlexibleWorkMode: true,
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP005',
    password: 'staff123',
  },
  {
    id: 'EMP006',
    name: 'Priya Iyer',
    email: 'priya.iyer@staffsync.io',
    phone: '+91 97890 23456',
    gender: 'Female',
    dob: '1997-06-30',
    address: 'Flat 3A, Temple Bells, T. Nagar, Chennai, Tamil Nadu 600017',
    emergencyContact: '+91 97890 98765 (Sundar Iyer - Father)',
    department: 'Finance',
    position: 'Financial Analyst',
    designation: 'Finance Associate',
    joiningDate: '2024-02-01',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'OFFICE',
    allowFlexibleWorkMode: false, // Strictly locked to Office by Admin policy
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP006',
    password: 'staff123',
  },
  {
    id: 'EMP007',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@staffsync.io',
    phone: '+91 98111 67890',
    gender: 'Male',
    dob: '1998-03-25',
    address: '44 DLF Phase 4, Gurugram, Haryana 122002',
    emergencyContact: '+91 98111 00000 (Rishi Malhotra - Brother)',
    department: 'Marketing',
    position: 'Growth Marketing Specialist',
    designation: 'Marketing Associate',
    joiningDate: '2024-05-10',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'HYBRID',
    allowFlexibleWorkMode: true,
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP007',
    password: 'staff123',
  },
  {
    id: 'EMP008',
    name: 'Ananya Roy',
    email: 'ananya.roy@staffsync.io',
    phone: '+91 98300 54321',
    gender: 'Female',
    dob: '1996-09-12',
    address: '18 Ballygunge Circular Rd, Kolkata, West Bengal 700019',
    emergencyContact: '+91 98300 88888 (Debabrata Roy - Father)',
    department: 'Design',
    position: 'Visual Brand Designer',
    designation: 'Product Designer',
    joiningDate: '2023-08-16',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'OFFICE',
    allowFlexibleWorkMode: false,
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP008',
    password: 'staff123',
  },
  {
    id: 'EMP009',
    name: 'Aman Verma',
    email: 'aman.verma@staffsync.io',
    phone: '+91 98990 11223',
    gender: 'Male',
    dob: '1995-07-19',
    address: 'Tower 4, Palm Springs, Golf Course Rd, Gurugram, Haryana 122002',
    emergencyContact: '+91 98990 44556 (Kavita Verma - Spouse)',
    department: 'Engineering',
    position: 'Senior Cloud Architect',
    designation: 'Principal Systems Architect',
    joiningDate: '2023-04-01',
    employmentType: 'Full Time',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'WORK FROM HOME',
    allowFlexibleWorkMode: true, // FEATURED EXAMPLE: Admin explicitly allowed Work From Anywhere (freely chooses Office, WFH, Hybrid)
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active',
    accountUsername: 'EMP009',
    password: 'staff123',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'HOL_01',
    name: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    description: 'National holiday commemorating Mahatma Gandhi birth anniversary',
    type: 'National',
  },
  {
    id: 'HOL_02',
    name: 'Dussehra (Vijayadashami)',
    date: '2026-10-20',
    description: 'Victory of good over evil celebration',
    type: 'Festival',
  },
  {
    id: 'HOL_03',
    name: 'Diwali (Deepavali)',
    date: '2026-11-08',
    description: 'Festival of Lights annual celebration',
    type: 'Festival',
  },
  {
    id: 'HOL_04',
    name: 'Christmas Day',
    date: '2026-12-25',
    description: 'Annual Christmas celebration',
    type: 'Festival',
  },
  {
    id: 'HOL_05',
    name: 'Republic Day',
    date: '2026-01-26',
    description: 'Commemoration of the Constitution of India',
    type: 'National',
  },
  {
    id: 'HOL_06',
    name: 'Annual Corporate Foundation Day',
    date: '2026-04-15',
    description: 'Organization founding anniversary holiday',
    type: 'Company',
  },
];

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

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'StaffSync Systems Inc.',
  logoText: 'StaffSync',
  address: 'Level 8, Horizon Business Park, Bengaluru, Karnataka 560103',
  contactEmail: 'admin@staffsync.io',
  contactPhone: '+91 80 4429 8800',
  timezone: 'Asia/Kolkata',
};

export const INITIAL_BRANDING: BrandingSettings = {
  organizationId: 'ORG_DEFAULT',
  projectName: 'StaffSync',
  logoUrl: null,
  faviconUrl: null,
  updatedAt: '2026-10-08 09:00 AM',
  updatedBy: 'System Default',
};

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LEV_001',
    employeeId: 'EMP004',
    employeeName: 'Sneha Joshi',
    department: 'Human Resources',
    leaveType: 'Personal Leave',
    startDate: '2026-10-07',
    endDate: '2026-10-08',
    totalDays: 2,
    reason: 'Attending family wedding ceremony out of town',
    notes: 'Handover complete with team',
    status: 'Approved',
    appliedAt: '2026-10-04 10:15 AM',
    reviewedBy: 'Devendra Sharma (Admin)',
    reviewedAt: '2026-10-05 11:30 AM',
    reviewRemarks: 'Approved. Enjoy the wedding!',
  },
  {
    id: 'LEV_002',
    employeeId: 'EMP007',
    employeeName: 'Karan Malhotra',
    department: 'Marketing',
    leaveType: 'Sick Leave',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    totalDays: 1,
    reason: 'Viral fever and doctor consultation',
    notes: 'Prescription will be submitted tomorrow',
    status: 'Approved',
    appliedAt: '2026-10-07 08:30 AM',
    reviewedBy: 'Devendra Sharma (Admin)',
    reviewedAt: '2026-10-07 09:00 AM',
    reviewRemarks: 'Approved. Get well soon.',
  },
  {
    id: 'LEV_003',
    employeeId: 'EMP005',
    employeeName: 'Vikram Rathore',
    department: 'Engineering',
    leaveType: 'Casual Leave',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    totalDays: 3,
    reason: 'Planned family trip',
    notes: 'SRE on-call rotated with Rahul',
    status: 'Pending',
    appliedAt: '2026-10-06 04:20 PM',
  },
];

// Helper to generate realistic attendance data for today (2026-10-07) and preceding 30 days
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const todayStr = '2026-10-07';

  // TODAY'S REAL ATTENDANCE (Wednesday, 7 October 2026)
  records.push(
    {
      id: 'ATT_20261007_EMP001',
      employeeId: 'EMP001',
      employeeName: 'Rahul Patil',
      department: 'Engineering',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: '09:22 AM',
      punchOut: null,
      status: 'WORKING',
      workMode: 'HYBRID',
      workingHoursMinutes: 288,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Punched in on time from office',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP002',
      employeeId: 'EMP002',
      employeeName: 'Janhavi Dev',
      department: 'Design',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: '09:42 AM',
      punchOut: null,
      status: 'WORKING',
      workMode: 'OFFICE',
      workingHoursMinutes: 270,
      lateDurationMinutes: 0, // within 15 min grace (starts 09:30 + 15 = 09:45)
      overtimeMinutes: 0,
      remarks: 'Punched in at design studio',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP003',
      employeeId: 'EMP003',
      employeeName: 'Amit Sharma',
      department: 'Operations',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: '09:58 AM',
      punchOut: null,
      status: 'LATE',
      workMode: 'OFFICE',
      workingHoursMinutes: 254,
      lateDurationMinutes: 13, // 13 mins late past grace cutoff (09:45)
      overtimeMinutes: 0,
      remarks: 'Delayed due to metro rail maintenance',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP004',
      employeeId: 'EMP004',
      employeeName: 'Sneha Joshi',
      department: 'Human Resources',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: null,
      punchOut: null,
      status: 'ON LEAVE',
      workMode: 'HYBRID',
      workingHoursMinutes: 0,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Approved Personal Leave (LEV_001)',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Rathore',
      department: 'Engineering',
      date: todayStr,
      shiftId: 'SHIFT_MORNING',
      shiftName: 'Morning Shift',
      punchIn: '07:55 AM',
      punchOut: null,
      status: 'WORKING',
      workMode: 'WORK FROM HOME',
      workingHoursMinutes: 375,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Early punch in for server maintenance window',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP006',
      employeeId: 'EMP006',
      employeeName: 'Priya Iyer',
      department: 'Finance',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: '09:15 AM',
      punchOut: null,
      status: 'WORKING',
      workMode: 'OFFICE',
      workingHoursMinutes: 295,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'On site quarterly audit preparation',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP007',
      employeeId: 'EMP007',
      employeeName: 'Karan Malhotra',
      department: 'Marketing',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: null,
      punchOut: null,
      status: 'ON LEAVE',
      workMode: 'HYBRID',
      workingHoursMinutes: 0,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Approved Sick Leave (LEV_002)',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP008',
      employeeId: 'EMP008',
      employeeName: 'Ananya Roy',
      department: 'Design',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: null,
      punchOut: null,
      status: 'NOT PUNCHED IN',
      workMode: 'OFFICE',
      workingHoursMinutes: 0,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Awaiting punch in',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    },
    {
      id: 'ATT_20261007_EMP009',
      employeeId: 'EMP009',
      employeeName: 'Aman Verma',
      department: 'Engineering',
      date: todayStr,
      shiftId: 'SHIFT_GEN',
      shiftName: 'General Shift',
      punchIn: null,
      punchOut: null,
      status: 'NOT PUNCHED IN',
      workMode: 'WORK FROM HOME',
      workingHoursMinutes: 0,
      lateDurationMinutes: 0,
      overtimeMinutes: 0,
      remarks: 'Awaiting punch in (Work from anywhere authorized)',
      modifiedBy: null,
      modifiedAt: null,
      modificationReason: null,
    }
  );

  // Generate historical dates back 20 business days
  const baseDate = new Date(2026, 9, 6); // Oct 6, 2026 (yesterday)
  for (let i = 0; i < 22; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() - i);
    const yyyy = curDate.getFullYear();
    const mm = String(curDate.getMonth() + 1).padStart(2, '0');
    const dd = String(curDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = curDate.getDay(); // 0 is Sunday, 6 is Saturday

    // Check holiday
    const isHoliday = dateStr === '2026-10-02'; // Gandhi Jayanti

    INITIAL_EMPLOYEES.forEach((emp, empIdx) => {
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6 && emp.weeklyOffDays.includes('Saturday');

      if (isHoliday) {
        records.push({
          id: `ATT_${dateStr.replace(/-/g, '')}_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: dateStr,
          shiftId: emp.shiftId,
          shiftName: 'General Shift',
          punchIn: null,
          punchOut: null,
          status: 'HOLIDAY',
          workMode: emp.defaultWorkMode,
          workingHoursMinutes: 0,
          lateDurationMinutes: 0,
          overtimeMinutes: 0,
          remarks: 'Mahatma Gandhi Jayanti Holiday',
          modifiedBy: null,
          modifiedAt: null,
          modificationReason: null,
        });
        return;
      }

      if (isSunday || isSaturday) {
        records.push({
          id: `ATT_${dateStr.replace(/-/g, '')}_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: dateStr,
          shiftId: emp.shiftId,
          shiftName: 'General Shift',
          punchIn: null,
          punchOut: null,
          status: 'WEEK OFF',
          workMode: emp.defaultWorkMode,
          workingHoursMinutes: 0,
          lateDurationMinutes: 0,
          overtimeMinutes: 0,
          remarks: 'Scheduled weekly off',
          modifiedBy: null,
          modifiedAt: null,
          modificationReason: null,
        });
        return;
      }

      // Business day simulation
      // Occasional late or leave
      const pseudoRandom = (i * 7 + empIdx * 13) % 100;
      let status: 'PRESENT' | 'LATE' | 'ON LEAVE' | 'ABSENT' = 'PRESENT';
      let inTime = '09:25 AM';
      let outTime = '06:35 PM';
      let workMins = 550; // 9 hrs 10 mins
      let lateMins = 0;
      let otMins = 10;
      let remarks = 'Regular attendance marked';

      if (pseudoRandom < 8) {
        status = 'LATE';
        inTime = '10:04 AM';
        outTime = '06:45 PM';
        workMins = 521;
        lateMins = 19;
        otMins = 0;
        remarks = 'Late arrival recorded';
      } else if (pseudoRandom < 12) {
        status = 'ON LEAVE';
        inTime = null as any;
        outTime = null as any;
        workMins = 0;
        lateMins = 0;
        otMins = 0;
        remarks = 'Pre-approved casual leave';
      } else if (pseudoRandom < 14) {
        status = 'ABSENT';
        inTime = null as any;
        outTime = null as any;
        workMins = 0;
        lateMins = 0;
        otMins = 0;
        remarks = 'Unexcused absence marked';
      } else {
        const minVariance = (pseudoRandom % 15) - 7;
        const inM = 25 + minVariance;
        const outM = 30 + (pseudoRandom % 25);
        inTime = `09:${String(inM).padStart(2, '0')} AM`;
        outTime = `06:${String(outM).padStart(2, '0')} PM`;
        workMins = 540 + outM - inM;
        otMins = Math.max(0, outM - 30);
      }

      records.push({
        id: `ATT_${dateStr.replace(/-/g, '')}_${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: dateStr,
        shiftId: emp.shiftId,
        shiftName: 'General Shift',
        punchIn: inTime,
        punchOut: outTime,
        status,
        workMode: emp.defaultWorkMode,
        workingHoursMinutes: workMins,
        lateDurationMinutes: lateMins,
        overtimeMinutes: otMins,
        remarks,
        modifiedBy: null,
        modifiedAt: null,
        modificationReason: null,
      });
    });
  }

  return records;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD_001',
    action: 'Punch Rules Updated',
    user: 'Devendra Sharma',
    role: 'ADMIN',
    timestamp: '2026-10-06 05:40 PM',
    details: 'Updated grace period from 10 minutes to 15 minutes across all departments',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'AUD_002',
    action: 'Leave Approved',
    user: 'Devendra Sharma',
    role: 'ADMIN',
    timestamp: '2026-10-07 09:00 AM',
    details: 'Approved Sick Leave request for Karan Malhotra (EMP007)',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'AUD_003',
    action: 'Employee Created',
    user: 'Devendra Sharma',
    role: 'ADMIN',
    timestamp: '2026-09-28 02:15 PM',
    details: 'Generated account credentials and assigned General Shift for Ananya Roy (EMP008)',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'AUD_004',
    action: 'Attendance Modified',
    user: 'Devendra Sharma',
    role: 'ADMIN',
    timestamp: '2026-10-05 06:12 PM',
    details: 'Corrected punch-out time for Janhavi Dev (EMP002) for date 2026-10-05 due to biometric reader timeout',
    ipAddress: '192.168.1.104',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOT_001',
    title: 'Upcoming Festival Holiday',
    message: 'Dussehra (Vijayadashami) holiday scheduled on Tuesday, October 20, 2026.',
    type: 'announcement',
    targetEmployeeId: 'ALL',
    read: false,
    createdAt: '2026-10-06 10:00 AM',
  },
  {
    id: 'NOT_002',
    title: 'Punch In Completed',
    message: 'Successfully punched in at 09:42 AM today in OFFICE mode.',
    type: 'success',
    targetEmployeeId: 'EMP002',
    read: true,
    createdAt: '2026-10-07 09:42 AM',
  },
  {
    id: 'NOT_003',
    title: 'Late Arrival Recorded',
    message: 'Punch-in recorded past the 15-minute grace threshold at 09:58 AM.',
    type: 'warning',
    targetEmployeeId: 'EMP003',
    read: false,
    createdAt: '2026-10-07 09:58 AM',
  },
];

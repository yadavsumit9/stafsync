-- ==============================================================================
-- STAFFSYNC ATTENDANCE MANAGEMENT SYSTEM — PRODUCTION DATABASE MIGRATION
-- Database: Supabase PostgreSQL
-- Idempotent script: Safe to execute multiple times without overwriting or deleting data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Authentication & Role credentials)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  must_change_password INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  password_last_changed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));

-- 3. SHIFTS TABLE (Work timing, grace periods & overtime rules)
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  grace_period_minutes INTEGER NOT NULL DEFAULT 10,
  min_working_hours REAL NOT NULL DEFAULT 8,
  max_working_hours REAL NOT NULL DEFAULT 12,
  break_duration_minutes INTEGER DEFAULT 60,
  half_day_threshold_hours REAL DEFAULT 4,
  full_day_threshold_hours REAL DEFAULT 8,
  allow_early_punch_in INTEGER DEFAULT 1,
  max_early_punch_in_minutes INTEGER DEFAULT 60,
  enable_overtime INTEGER DEFAULT 1,
  working_days TEXT DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EMPLOYEES TABLE (Staff directory, designations, and personalized schedules)
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT DEFAULT 'Male',
  dob TEXT DEFAULT '1995-01-01',
  address TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  designation TEXT NOT NULL,
  joining_date TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'Full Time',
  shift_id TEXT NOT NULL DEFAULT 'SHIFT_GEN',
  default_work_mode TEXT NOT NULL DEFAULT 'OFFICE',
  allow_flexible_work_mode INTEGER DEFAULT 0,
  weekly_off_days TEXT NOT NULL DEFAULT '["Sunday","Saturday"]',
  status TEXT NOT NULL DEFAULT 'Active',
  custom_timing INTEGER DEFAULT 0,
  shift_start_time TEXT,
  shift_end_time TEXT,
  grace_period_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(LOWER(email));

-- 5. ATTENDANCE TABLE (Daily punch logs, worked hours & punctuality status)
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  organization_id TEXT DEFAULT 'ORG_DEFAULT',
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date TEXT NOT NULL,
  shift_id TEXT NOT NULL,
  shift_name TEXT NOT NULL,
  punch_in TEXT,
  punch_out TEXT,
  punch_in_at TIMESTAMPTZ,
  punch_out_at TIMESTAMPTZ,
  punch_in_status TEXT,
  punch_out_status TEXT,
  early_minutes INTEGER DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  grace_adjusted_late_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  attendance_value REAL DEFAULT 0,
  work_mode TEXT NOT NULL DEFAULT 'OFFICE',
  working_hours_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,
  late_duration_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  shift_start_at TEXT,
  shift_end_at TEXT,
  half_day_threshold_minutes INTEGER DEFAULT 240,
  full_day_threshold_minutes INTEGER DEFAULT 480,
  calculation_source TEXT DEFAULT 'SERVER_PUNCH',
  manual_adjustment_reason TEXT,
  remarks TEXT,
  modified_by TEXT,
  modified_at TIMESTAMPTZ,
  modification_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_dept ON attendance(department);

-- 6. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  applied_on TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_on TEXT,
  review_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaves_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_requests(status);

-- 7. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS holidays (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  target_employee_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SYSTEM SETTINGS TABLE (Key-value store for punch, company, and branding settings)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public access with anon key (Application enforces authoritative business logic & password hashes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on users' AND tablename = 'users') THEN
    CREATE POLICY "Allow anon all on users" ON users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on employees' AND tablename = 'employees') THEN
    CREATE POLICY "Allow anon all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on attendance' AND tablename = 'attendance') THEN
    CREATE POLICY "Allow anon all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on shifts' AND tablename = 'shifts') THEN
    CREATE POLICY "Allow anon all on shifts" ON shifts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on leave_requests' AND tablename = 'leave_requests') THEN
    CREATE POLICY "Allow anon all on leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on holidays' AND tablename = 'holidays') THEN
    CREATE POLICY "Allow anon all on holidays" ON holidays FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on audit_logs' AND tablename = 'audit_logs') THEN
    CREATE POLICY "Allow anon all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Allow anon all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on system_settings' AND tablename = 'system_settings') THEN
    CREATE POLICY "Allow anon all on system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ==============================================================================
-- IDEMPOTENT INITIAL SYSTEM SEED DATA (DO NOT OVERWRITE EXISTING PRODUCTION DATA)
-- ==============================================================================

-- Initial Admin Account (ADM-7X4Q9M2K / temporary pass: V9!rK7#pL2@Xq8$N)
INSERT INTO users (id, username, password_hash, role, must_change_password, created_at)
VALUES (
  'USR_ADMIN_01',
  'ADM-7X4Q9M2K',
  '$2b$10$dU9FYpOXJW4Lu/azNZRMx.jbk.yPuz.TeoLKMB/OGAbgN7.J4OfuW',
  'admin',
  1,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Standard Baseline Shift
INSERT INTO shifts (
  id, name, start_time, end_time, grace_period_minutes, min_working_hours, max_working_hours,
  break_duration_minutes, half_day_threshold_hours, full_day_threshold_hours,
  allow_early_punch_in, max_early_punch_in_minutes, enable_overtime, working_days, description
) VALUES (
  'SHIFT_GEN',
  'General Shift',
  '09:00',
  '18:00',
  10,
  8,
  12,
  60,
  4,
  8,
  1,
  60,
  1,
  'Monday,Tuesday,Wednesday,Thursday,Friday',
  'Standard 9-hour corporate schedule with 1 hr lunch break (09:00 AM – 06:00 PM)'
)
ON CONFLICT (id) DO NOTHING;

-- Baseline Company Settings
INSERT INTO system_settings (key, value)
VALUES (
  'company_settings',
  '{"companyName":"StaffSync Systems Inc.","logoText":"StaffSync","address":"Corporate Headquarters","contactEmail":"admin@staffsync.io","contactPhone":"+1 (800) 555-0199","timezone":"Asia/Kolkata"}'
)
ON CONFLICT (key) DO NOTHING;

-- Baseline Punch Rules
INSERT INTO system_settings (key, value)
VALUES (
  'punch_settings',
  '{"enablePunchIn":true,"enablePunchOut":true,"maxPunchInTime":"11:00","maxPunchOutTime":"21:00","minWorkingHours":8,"allowEarlyPunchIn":true,"maxEarlyPunchInMinutes":60,"allowLatePunchIn":true,"gracePeriodMinutes":10,"allowEarlyPunchOut":true,"minHoursRequiredForHalfDay":4,"minHoursRequiredForFullDay":8,"halfDayAttendanceValue":0.5,"fullDayAttendanceValue":1,"autoPunchOutAtShiftEnd":false,"enableOvertime":true,"overtimeStartRule":"AFTER_SHIFT_END","countEarlyWorkAsOvertime":false,"countLateWorkTowardOvertime":true,"breakDurationMinutes":60,"markLateAutomatically":true,"allowMultiplePunches":false,"allowStaffManualAttendance":false,"allowStaffChangeWorkMode":true}'
)
ON CONFLICT (key) DO NOTHING;

-- Baseline Branding Settings
INSERT INTO system_settings (key, value)
VALUES (
  'branding_settings',
  '{"organizationId":"ORG_DEFAULT","projectName":"StaffSync","logoUrl":null,"faviconUrl":null,"updatedAt":"2026-10-09T00:00:00.000Z","updatedBy":"System Default"}'
)
ON CONFLICT (key) DO NOTHING;

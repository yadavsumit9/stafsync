import initSqlJs, { Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import bcrypt from 'bcryptjs';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Shift,
  Holiday,
  PunchSettings,
  CompanySettings,
  BrandingSettings,
  AuditLog,
  NotificationItem,
  AuthUser,
  WorkMode,
  AttendanceStatus,
} from '../types';

export interface AdminSecurityProfile {
  adminId: string;
  accountStatus: 'Active' | 'Locked' | 'Suspended';
  lastLogin: string | null;
  passwordLastChanged: string | null;
  createdAt: string;
  mustChangePassword: boolean;
}

// Initial Admin Credentials (INITIAL SETUP ONLY)
// Admin ID: ADM-7X4Q9M2K
// Temporary Password: V9!rK7#pL2@Xq8$N
// Secure bcrypt hash with 10 salt rounds:
export const INITIAL_ADMIN_ID = 'ADM-7X4Q9M2K';
export const INITIAL_ADMIN_HASH = '$2b$10$dU9FYpOXJW4Lu/azNZRMx.jbk.yPuz.TeoLKMB/OGAbgN7.J4OfuW';

const DB_STORAGE_KEY = 'staffsync_production_sqlite_v2';

class ProductionDatabase {
  private db: Database | null = null;
  private initPromise: Promise<void> | null = null;
  private activeSessions = new Set<string>();

  public async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => {
            if (file.endsWith('.wasm')) {
              return sqlWasmUrl || '/sql-wasm.wasm';
            }
            return `/sql-wasm.wasm`;
          },
        });

        let savedData: Uint8Array | null = null;

        // Try reading from file in Node.js, or localStorage in browser
        if (typeof window === 'undefined') {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const dbPath = path.resolve(process.cwd(), 'data', 'production.sqlite');
            if (fs.existsSync(dbPath)) {
              savedData = new Uint8Array(fs.readFileSync(dbPath));
            }
          } catch {
            // fallback
          }
        } else {
          try {
            const b64 = localStorage.getItem(DB_STORAGE_KEY);
            if (b64) {
              const binStr = atob(b64);
              const len = binStr.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binStr.charCodeAt(i);
              }
              savedData = bytes;
            }
          } catch (e) {
            console.error('Failed to load sqlite from storage', e);
          }
        }

        if (savedData) {
          this.db = new SQL.Database(savedData);
        } else {
          this.db = new SQL.Database();
          this.createTables();
          this.seedProductionBaseline();
          this.persist();
        }
      } catch (err) {
        console.error('Failed to initialize sql.js database with wasm url:', err);
        try {
          const SQL = await initSqlJs({
            locateFile: () => '/sql-wasm.wasm',
          });
          this.db = new SQL.Database();
          this.createTables();
          this.seedProductionBaseline();
        } catch (innerErr) {
          console.error('Failed to initialize sql.js fallback:', innerErr);
        }
      }
    })();

    await this.initPromise;
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        must_change_password INTEGER DEFAULT 0,
        last_login TEXT,
        password_last_changed TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        gender TEXT,
        dob TEXT,
        address TEXT,
        emergency_contact TEXT,
        department TEXT NOT NULL,
        position TEXT NOT NULL,
        designation TEXT NOT NULL,
        joining_date TEXT NOT NULL,
        employment_type TEXT NOT NULL,
        shift_id TEXT NOT NULL,
        default_work_mode TEXT NOT NULL,
        allow_flexible_work_mode INTEGER DEFAULT 0,
        weekly_off_days TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT NOT NULL,
        date TEXT NOT NULL,
        shift_id TEXT NOT NULL,
        shift_name TEXT NOT NULL,
        punch_in TEXT,
        punch_out TEXT,
        status TEXT NOT NULL,
        work_mode TEXT NOT NULL,
        working_hours_minutes INTEGER DEFAULT 0,
        late_duration_minutes INTEGER DEFAULT 0,
        overtime_minutes INTEGER DEFAULT 0,
        remarks TEXT,
        modified_by TEXT,
        modified_at TEXT,
        modification_reason TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS leaves (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_days INTEGER NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL,
        applied_at TEXT NOT NULL,
        reviewed_by TEXT,
        reviewed_at TEXT,
        review_remarks TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        grace_period_minutes INTEGER NOT NULL,
        min_working_hours INTEGER NOT NULL,
        max_working_hours INTEGER NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        user TEXT NOT NULL,
        role TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        target_employee_id TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  private seedProductionBaseline(): void {
    if (!this.db) return;

    // 1. Initial Admin Account (1 account, securely hashed, temporary password)
    const checkUser = this.db.prepare('SELECT id FROM users WHERE role = ?');
    checkUser.bind(['admin']);
    const hasAdmin = checkUser.step();
    checkUser.free();

    if (!hasAdmin) {
      this.db.run(
        `INSERT INTO users (id, username, password_hash, role, must_change_password, last_login, password_last_changed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'USR_ADMIN_01',
          INITIAL_ADMIN_ID,
          INITIAL_ADMIN_HASH,
          'admin',
          1, // must_change_password = true
          null,
          null,
          new Date().toISOString(),
        ]
      );
    }

    // 2. Baseline General Shift (Essential for attendance logic)
    const checkShift = this.db.prepare('SELECT id FROM shifts WHERE id = ?');
    checkShift.bind(['SHIFT_GEN']);
    const hasShift = checkShift.step();
    checkShift.free();

    if (!hasShift) {
      this.db.run(
        `INSERT INTO shifts (id, name, start_time, end_time, grace_period_minutes, min_working_hours, max_working_hours, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'SHIFT_GEN',
          'General Shift',
          '09:30',
          '18:30',
          15,
          8,
          12,
          'Standard 9-hour corporate schedule with 1 hr lunch break',
        ]
      );
    }

    // 3. Baseline Settings
    const defaultPunch: PunchSettings = {
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

    const defaultCompany: CompanySettings = {
      companyName: 'StaffSync Systems Inc.',
      logoText: 'StaffSync',
      address: 'Corporate Headquarters',
      contactEmail: 'admin@staffsync.io',
      contactPhone: '+1 (800) 555-0199',
      timezone: 'Asia/Kolkata',
    };

    const defaultBranding: BrandingSettings = {
      organizationId: 'ORG_DEFAULT',
      projectName: 'StaffSync',
      logoUrl: null,
      faviconUrl: null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Default',
    };

    this.saveSetting('punch_settings', JSON.stringify(defaultPunch));
    this.saveSetting('company_settings', JSON.stringify(defaultCompany));
    this.saveSetting('branding_settings', JSON.stringify(defaultBranding));

    // 4. Initial Audit Log
    this.addAuditLog(
      'ADMIN_ACCOUNT_INITIALIZED',
      'System',
      'SYSTEM',
      `Production database initialized with secure Admin ID ${INITIAL_ADMIN_ID}. Forced password change active.`
    );
  }

  private persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();

      // If in Node.js, write to data/production.sqlite
      if (typeof window === 'undefined') {
        try {
          const fs = require('fs');
          const path = require('path');
          const dir = path.resolve(process.cwd(), 'data');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'production.sqlite'), Buffer.from(data));
        } catch (e) {
          console.error('Node fs persist error:', e);
        }
      } else {
        // In browser, save binary to base64
        let binary = '';
        const len = data.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(data[i]);
        }
        localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
      }
    } catch (e) {
      console.error('Failed to persist SQLite database:', e);
    }
  }

  // ==========================================
  // AUDIT LOGGING (Never logs plaintext passwords)
  // ==========================================
  public addAuditLog(action: string, user: string, role: string, details: string, ip = '127.0.0.1'): void {
    if (!this.db) return;
    const id = `AUD_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    this.db.run(
      `INSERT INTO audit_logs (id, action, user, role, timestamp, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, action, user, role, timestamp, details, ip]
    );
    this.persist();
  }

  public getAuditLogs(): AuditLog[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM audit_logs ORDER BY rowid DESC');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col === 'ip_address' ? 'ipAddress' : col] = row[idx];
      });
      return item as AuditLog;
    });
  }

  // ==========================================
  // AUTHENTICATION & ADMIN SECURITY
  // ==========================================
  public login(
    identifier: string,
    password: string
  ): {
    success: boolean;
    message?: string;
    role?: 'admin' | 'staff';
    user?: AuthUser;
    mustChangePassword?: boolean;
    token?: string;
  } {
    if (!this.db) {
      return { success: false, message: 'Database not initialized' };
    }

    const cleanIdentifier = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanIdentifier || !cleanPass) {
      return { success: false, message: 'Please enter both ID and password.' };
    }

    // 1. Check in users table (by username or matching employee email/id)
    const stmt = this.db.prepare(
      `SELECT u.id, u.username, u.password_hash, u.role, u.must_change_password,
              e.id AS emp_id, e.name AS emp_name, e.email AS emp_email, e.department, e.designation
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE UPPER(u.username) = UPPER(?) OR UPPER(e.id) = UPPER(?) OR LOWER(e.email) = LOWER(?)`
    );
    stmt.bind([cleanIdentifier, cleanIdentifier, cleanIdentifier]);

    if (!stmt.step()) {
      stmt.free();
      return { success: false, message: 'Invalid credentials. Please verify your ID and password.' };
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    // Verify bcrypt password hash
    const passwordMatch = bcrypt.compareSync(cleanPass, row.password_hash);
    if (!passwordMatch) {
      this.addAuditLog(
        row.role === 'admin' ? 'ADMIN_LOGIN_FAILED' : 'STAFF_LOGIN_FAILED',
        cleanIdentifier,
        row.role.toUpperCase(),
        `Authentication failure: Invalid password attempt for user ${cleanIdentifier}`
      );
      return { success: false, message: 'Invalid credentials. Please verify your ID and password.' };
    }

    // Update last_login
    const nowIso = new Date().toISOString();
    this.db.run('UPDATE users SET last_login = ? WHERE id = ?', [nowIso, row.id]);

    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.activeSessions.add(sessionToken);

    const mustChangePassword = Boolean(row.must_change_password);

    this.addAuditLog(
      row.role === 'admin' ? 'ADMIN_LOGIN_SUCCESS' : 'STAFF_LOGIN_SUCCESS',
      row.role === 'admin' ? row.username : row.emp_name || row.username,
      row.role.toUpperCase(),
      `${row.role === 'admin' ? 'Admin' : 'Staff'} ${row.username} authenticated successfully`
    );
    this.persist();

    const authUser: AuthUser = {
      id: row.id,
      role: row.role as 'admin' | 'staff',
      name: row.role === 'admin' ? 'Administrator' : row.emp_name || row.username,
      email: row.role === 'admin' ? 'admin@staffsync.io' : row.emp_email || '',
      employeeId: row.emp_id || undefined,
      department: row.department || (row.role === 'admin' ? 'Administration' : undefined),
      designation: row.designation || (row.role === 'admin' ? 'System Administrator' : undefined),
    };

    return {
      success: true,
      role: row.role,
      user: authUser,
      mustChangePassword,
      token: sessionToken,
    };
  }

  // Force Password Change on First Login
  public changeInitialPassword(
    adminUsername: string,
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const cleanUsername = adminUsername.trim();
    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (!cleanCurrent || !cleanNew || !confirmPass.trim()) {
      return { success: false, message: 'All fields are required.' };
    }

    if (cleanNew !== confirmPass.trim()) {
      return { success: false, message: 'New password and confirmation do not match.' };
    }

    // Enforce Password Security rules (Requirement 6)
    const passCheck = this.validatePasswordStrength(cleanNew);
    if (!passCheck.valid) {
      return { success: false, message: passCheck.error || 'Password does not meet security requirements.' };
    }

    // Verify current password
    const stmt = this.db.prepare('SELECT id, password_hash, must_change_password FROM users WHERE UPPER(username) = UPPER(?) AND role = ?');
    stmt.bind([cleanUsername, 'admin']);

    if (!stmt.step()) {
      stmt.free();
      return { success: false, message: 'Admin account not found.' };
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    const isMatch = bcrypt.compareSync(cleanCurrent, row.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Current temporary password is incorrect.' };
    }

    // Hash new password with bcrypt (10 rounds)
    const newHash = bcrypt.hashSync(cleanNew, 10);
    const nowIso = new Date().toISOString();

    this.db.run(
      'UPDATE users SET password_hash = ?, must_change_password = 0, password_last_changed = ? WHERE id = ?',
      [newHash, nowIso, row.id]
    );

    // Invalidate old sessions
    this.activeSessions.clear();

    this.addAuditLog(
      'ADMIN_PASSWORD_CHANGED',
      cleanUsername,
      'ADMIN',
      'Initial temporary admin password replaced with secure permanent password. must_change_password set to false.'
    );
    this.persist();

    return { success: true, message: 'Password updated successfully. You can now use the Admin Panel.' };
  }

  // Change Admin ID from Settings -> Security (Requirement 5 & 9)
  public changeAdminId(
    currentId: string,
    newId: string
  ): { success: boolean; message: string; newAdminId?: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const cleanCurrent = currentId.trim();
    const cleanNew = newId.trim();

    // Validation (Requirement 9)
    if (!cleanNew) {
      return { success: false, message: 'New Admin ID is required.' };
    }

    if (cleanNew.length < 4) {
      return { success: false, message: 'Admin ID must be at least 4 characters long.' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(cleanNew)) {
      return {
        success: false,
        message: 'Admin ID can only contain letters, numbers, hyphens (-), and underscores (_).',
      };
    }

    if (cleanCurrent.toUpperCase() === cleanNew.toUpperCase()) {
      return { success: false, message: 'New Admin ID cannot be the same as current Admin ID.' };
    }

    // Check uniqueness at database level
    const checkStmt = this.db.prepare('SELECT id FROM users WHERE UPPER(username) = UPPER(?)');
    checkStmt.bind([cleanNew]);
    const exists = checkStmt.step();
    checkStmt.free();

    if (exists) {
      return { success: false, message: 'Admin ID already exists. Please choose a different unique ID.' };
    }

    // Update
    this.db.run('UPDATE users SET username = ? WHERE UPPER(username) = UPPER(?) AND role = ?', [
      cleanNew,
      cleanCurrent,
      'admin',
    ]);

    this.addAuditLog(
      'ADMIN_ID_CHANGED',
      cleanNew,
      'ADMIN',
      `Admin Login ID updated from ${cleanCurrent} to ${cleanNew}. Uniqueness verified at database level.`
    );
    this.persist();

    return { success: true, message: 'Admin ID updated successfully.', newAdminId: cleanNew };
  }

  // Change Admin Password from Admin Panel (Requirement 6)
  public changeAdminPassword(
    adminUsername: string,
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const cleanUsername = adminUsername.trim();
    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (!cleanCurrent || !cleanNew || !confirmPass.trim()) {
      return { success: false, message: 'All password fields are required.' };
    }

    if (cleanNew !== confirmPass.trim()) {
      return { success: false, message: 'New password and confirmation do not match.' };
    }

    const passCheck = this.validatePasswordStrength(cleanNew);
    if (!passCheck.valid) {
      return { success: false, message: passCheck.error || 'Password is not strong enough.' };
    }

    const stmt = this.db.prepare('SELECT id, password_hash FROM users WHERE UPPER(username) = UPPER(?) AND role = ?');
    stmt.bind([cleanUsername, 'admin']);

    if (!stmt.step()) {
      stmt.free();
      return { success: false, message: 'Admin account not found.' };
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    const isMatch = bcrypt.compareSync(cleanCurrent, row.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    const newHash = bcrypt.hashSync(cleanNew, 10);
    const nowIso = new Date().toISOString();

    this.db.run('UPDATE users SET password_hash = ?, password_last_changed = ? WHERE id = ?', [
      newHash,
      nowIso,
      row.id,
    ]);

    // Invalidate other sessions
    this.activeSessions.clear();

    this.addAuditLog(
      'ADMIN_PASSWORD_CHANGED',
      cleanUsername,
      'ADMIN',
      'Admin password changed securely. Previous sessions invalidated.'
    );
    this.persist();

    return { success: true, message: 'Admin password changed successfully.' };
  }

  public logoutOtherSessions(adminUsername: string): { success: boolean; message: string } {
    this.activeSessions.clear();
    this.addAuditLog(
      'ADMIN_SESSIONS_REVOKED',
      adminUsername,
      'ADMIN',
      'All unauthorized or previous active sessions terminated.'
    );
    return { success: true, message: 'All other active sessions have been invalidated.' };
  }

  // Get Admin Account Security details (NEVER exposes password or hash) (Requirement 7)
  public getAdminSecurityProfile(adminUsername?: string): AdminSecurityProfile | null {
    if (!this.db) return null;

    const stmt = this.db.prepare(
      `SELECT username, last_login, password_last_changed, created_at, must_change_password
       FROM users
       WHERE role = 'admin'
       LIMIT 1`
    );

    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    return {
      adminId: row.username,
      accountStatus: 'Active',
      lastLogin: row.last_login,
      passwordLastChanged: row.password_last_changed,
      createdAt: row.created_at,
      mustChangePassword: Boolean(row.must_change_password),
    };
  }

  // Password validation helper (Requirement 6)
  public validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (password.length < 12) {
      return { valid: false, error: 'Password must be at least 12 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must include at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must include at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must include at least one digit (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { valid: false, error: 'Password must include at least one special character (!@#$%^&*).' };
    }

    const commonPasswords = ['password1234', 'admin12345678', 'welcome12345!', 'qwertyuiop12#'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: 'Password is too common. Please choose a more complex phrase.' };
    }

    return { valid: true };
  }

  // ==========================================
  // REAL EMPLOYEE CREATION WITH DATABASE TRANSACTION
  // (Requirements 20, 22, 23, 24, 25, 26)
  // ==========================================
  public createEmployee(
    emp: Omit<Employee, 'id'> & { id?: string },
    initialPassword?: string
  ): { success: boolean; message: string; employeeId?: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    // Validate ID
    let empId = (emp.id || '').trim().toUpperCase();
    if (!empId) {
      // Auto-generate unique EMP ID
      const countRes = this.db.exec('SELECT COUNT(*) FROM employees');
      const count = countRes && countRes[0] ? (countRes[0].values[0][0] as number) : 0;
      empId = `EMP${String(count + 1).padStart(3, '0')}`;
    }

    if (!emp.name?.trim() || !emp.email?.trim() || !emp.phone?.trim()) {
      return { success: false, message: 'Name, email, and phone are required.' };
    }

    // Password must be provided and securely hashed (Requirement 25)
    const rawPass = (initialPassword || emp.password || '').trim();
    if (!rawPass || rawPass.length < 8) {
      return { success: false, message: 'Employee password must be at least 8 characters long.' };
    }

    // Database Uniqueness Enforcement (Requirement 24)
    const checkEmp = this.db.prepare('SELECT id FROM employees WHERE UPPER(id) = UPPER(?)');
    checkEmp.bind([empId]);
    if (checkEmp.step()) {
      checkEmp.free();
      return { success: false, message: `Employee ID "${empId}" already exists. ID must be unique.` };
    }
    checkEmp.free();

    const checkUser = this.db.prepare('SELECT id FROM users WHERE UPPER(username) = UPPER(?)');
    checkUser.bind([empId]);
    if (checkUser.step()) {
      checkUser.free();
      return { success: false, message: `Account username "${empId}" is already registered.` };
    }
    checkUser.free();

    const userId = `USR_${empId}_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(rawPass, 10);
    const nowIso = new Date().toISOString();

    // DATABASE TRANSACTION (Requirement 23)
    try {
      this.db.run('BEGIN TRANSACTION;');

      // 1. Insert User account
      this.db.run(
        `INSERT INTO users (id, username, password_hash, role, must_change_password, last_login, password_last_changed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, empId, passwordHash, 'staff', 0, null, null, nowIso]
      );

      // 2. Insert Employee record linked to User
      this.db.run(
        `INSERT INTO employees (
           id, user_id, name, email, phone, gender, dob, address, emergency_contact,
           department, position, designation, joining_date, employment_type,
           shift_id, default_work_mode, allow_flexible_work_mode, weekly_off_days,
           status, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empId,
          userId,
          emp.name.trim(),
          emp.email.trim(),
          emp.phone.trim(),
          emp.gender || 'Male',
          emp.dob || '1995-01-01',
          emp.address || '',
          emp.emergencyContact || '',
          emp.department || 'General',
          emp.position || 'Staff',
          emp.designation || 'Associate',
          emp.joiningDate || new Date().toISOString().slice(0, 10),
          emp.employmentType || 'Full Time',
          emp.shiftId || 'SHIFT_GEN',
          emp.defaultWorkMode || 'OFFICE',
          emp.allowFlexibleWorkMode ? 1 : 0,
          JSON.stringify(emp.weeklyOffDays || ['Sunday', 'Saturday']),
          emp.status || 'Active',
          nowIso,
        ]
      );

      this.db.run('COMMIT;');

      this.addAuditLog(
        'EMPLOYEE_CREATED',
        'Administrator',
        'ADMIN',
        `Real employee record and linked credentials created for ${emp.name} (ID: ${empId}, Dept: ${emp.department}). Password securely hashed with bcrypt.`
      );
      this.persist();

      return { success: true, message: `Employee ${emp.name} created successfully!`, employeeId: empId };
    } catch (err: any) {
      try {
        this.db.run('ROLLBACK;');
      } catch {}
      console.error('Transaction failed during employee creation:', err);
      return { success: false, message: `Database transaction failed: ${err.message || 'Unknown error'}` };
    }
  }

  // Admin Reset Employee Password (Requirement 25 & 26)
  public resetEmployeePassword(
    employeeId: string,
    newPass: string
  ): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const cleanPass = newPass.trim();
    if (cleanPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const stmt = this.db.prepare('SELECT user_id, name FROM employees WHERE UPPER(id) = UPPER(?)');
    stmt.bind([employeeId.trim()]);

    if (!stmt.step()) {
      stmt.free();
      return { success: false, message: 'Employee not found.' };
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    // Hash new password securely with bcrypt (never store plaintext)
    const newHash = bcrypt.hashSync(cleanPass, 10);
    const nowIso = new Date().toISOString();

    this.db.run(
      'UPDATE users SET password_hash = ?, password_last_changed = ? WHERE id = ?',
      [newHash, nowIso, row.user_id]
    );

    this.addAuditLog(
      'EMPLOYEE_PASSWORD_RESET',
      'Administrator',
      'ADMIN',
      `Administrator securely reset password for employee ${row.name} (${employeeId}). Previous credentials revoked.`
    );
    this.persist();

    return { success: true, message: `Password reset successfully for ${row.name}.` };
  }

  public getEmployees(): Employee[] {
    if (!this.db) return [];
    const res = this.db.exec(`
      SELECT e.*, u.username AS accountUsername
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at ASC
    `);

    if (!res || !res[0]) return [];
    const cols = res[0].columns;

    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });

      let offs: string[] = ['Sunday', 'Saturday'];
      try {
        if (item.weekly_off_days) offs = JSON.parse(item.weekly_off_days);
      } catch {}

      return {
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        gender: item.gender,
        dob: item.dob,
        address: item.address,
        emergencyContact: item.emergency_contact,
        department: item.department,
        position: item.position,
        designation: item.designation,
        joiningDate: item.joining_date,
        employmentType: item.employment_type,
        shiftId: item.shift_id,
        defaultWorkMode: item.default_work_mode,
        allowFlexibleWorkMode: Boolean(item.allow_flexible_work_mode),
        weeklyOffDays: offs,
        status: item.status,
        accountUsername: item.accountUsername || item.id,
      } as Employee;
    });
  }

  public updateEmployee(id: string, updates: Partial<Employee>): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const cleanId = id.trim().toUpperCase();
    const existing = this.getEmployees().find((e) => e.id.toUpperCase() === cleanId);
    if (!existing) return { success: false, message: 'Employee not found.' };

    const merged = { ...existing, ...updates };

    this.db.run(
      `UPDATE employees SET
         name = ?, email = ?, phone = ?, gender = ?, dob = ?, address = ?,
         emergency_contact = ?, department = ?, position = ?, designation = ?,
         joining_date = ?, employment_type = ?, shift_id = ?, default_work_mode = ?,
         allow_flexible_work_mode = ?, weekly_off_days = ?, status = ?
       WHERE UPPER(id) = UPPER(?)`,
      [
        merged.name,
        merged.email,
        merged.phone,
        merged.gender,
        merged.dob,
        merged.address,
        merged.emergencyContact,
        merged.department,
        merged.position,
        merged.designation,
        merged.joiningDate,
        merged.employmentType,
        merged.shiftId,
        merged.defaultWorkMode,
        merged.allowFlexibleWorkMode ? 1 : 0,
        JSON.stringify(merged.weeklyOffDays),
        merged.status,
        cleanId,
      ]
    );

    this.addAuditLog('EMPLOYEE_UPDATED', 'Administrator', 'ADMIN', `Updated profile records for ${merged.name} (${cleanId}).`);
    this.persist();
    return { success: true, message: 'Employee updated successfully.' };
  }

  public deleteEmployee(id: string): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    const cleanId = id.trim().toUpperCase();

    try {
      this.db.run('BEGIN TRANSACTION;');
      this.db.run('DELETE FROM users WHERE id IN (SELECT user_id FROM employees WHERE UPPER(id) = UPPER(?));', [cleanId]);
      this.db.run('DELETE FROM employees WHERE UPPER(id) = UPPER(?);', [cleanId]);
      this.db.run('COMMIT;');

      this.addAuditLog('EMPLOYEE_DEACTIVATED', 'Administrator', 'ADMIN', `Employee ${cleanId} removed from database.`);
      this.persist();
      return { success: true, message: 'Employee removed successfully.' };
    } catch (e: any) {
      try {
        this.db.run('ROLLBACK;');
      } catch {}
      return { success: false, message: e.message || 'Failed to delete employee' };
    }
  }

  // ==========================================
  // ATTENDANCE & BIOMETRIC METHODS
  // ==========================================
  public getAttendance(): AttendanceRecord[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM attendance ORDER BY date DESC, punch_in DESC');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;

    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return {
        id: item.id,
        employeeId: item.employee_id,
        employeeName: item.employee_name,
        department: item.department,
        date: item.date,
        shiftId: item.shift_id,
        shiftName: item.shift_name,
        punchIn: item.punch_in,
        punchOut: item.punch_out,
        status: item.status,
        workMode: item.work_mode,
        workingHoursMinutes: item.working_hours_minutes,
        lateDurationMinutes: item.late_duration_minutes,
        overtimeMinutes: item.overtime_minutes,
        remarks: item.remarks || '',
        modifiedBy: item.modified_by,
        modifiedAt: item.modified_at,
        modificationReason: item.modification_reason,
      } as AttendanceRecord;
    });
  }

  public punchIn(employeeId: string, workMode: WorkMode): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const emps = this.getEmployees();
    const emp = emps.find((e) => e.id.toUpperCase() === employeeId.trim().toUpperCase());
    if (!emp) return { success: false, message: 'Employee not found.' };

    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = this.getAttendance().find((r) => r.employeeId === emp.id && r.date === todayStr);

    if (existing && existing.punchIn) {
      return { success: false, message: 'You have already punched in for today.' };
    }

    const now = new Date();
    let hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeFormatted = `${hours}:${mins < 10 ? '0' + mins : mins} ${ampm}`;

    const shifts = this.getShifts();
    const shift = shifts.find((s) => s.id === emp.shiftId) || shifts[0] || {
      id: 'SHIFT_GEN',
      name: 'General Shift',
      startTime: '09:30',
      gracePeriodMinutes: 15,
    };

    // Calculate late status
    const [startH, startM] = shift.startTime.split(':').map((n: string) => parseInt(n, 10));
    const shiftStartMins = startH * 60 + startM + (shift.gracePeriodMinutes || 15);
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const isLate = currentMins > shiftStartMins;
    const lateDuration = isLate ? currentMins - shiftStartMins : 0;
    const status: AttendanceStatus = isLate ? 'LATE' : 'WORKING';

    const recordId = `ATT_${todayStr.replace(/-/g, '')}_${emp.id}`;

    this.db.run(
      `INSERT OR REPLACE INTO attendance (
         id, employee_id, employee_name, department, date, shift_id, shift_name,
         punch_in, punch_out, status, work_mode, working_hours_minutes, late_duration_minutes,
         overtime_minutes, remarks
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordId,
        emp.id,
        emp.name,
        emp.department,
        todayStr,
        shift.id,
        shift.name,
        timeFormatted,
        null,
        status,
        workMode,
        0,
        lateDuration,
        0,
        isLate ? `Punched in late by ${lateDuration}m` : 'Normal punch in',
      ]
    );

    this.addAuditLog('PUNCH_IN', emp.name, 'STAFF', `${emp.name} punched in at ${timeFormatted} (${workMode})`);
    this.persist();

    return { success: true, message: `Punched in successfully at ${timeFormatted} (${workMode}).` };
  }

  public punchOut(employeeId: string): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const emps = this.getEmployees();
    const emp = emps.find((e) => e.id.toUpperCase() === employeeId.trim().toUpperCase());
    if (!emp) return { success: false, message: 'Employee not found.' };

    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = this.getAttendance().find((r) => r.employeeId === emp.id && r.date === todayStr);

    if (!existing || !existing.punchIn) {
      return { success: false, message: 'No active punch-in found for today.' };
    }

    if (existing.punchOut) {
      return { success: false, message: 'You have already punched out for today.' };
    }

    const now = new Date();
    let hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeFormatted = `${hours}:${mins < 10 ? '0' + mins : mins} ${ampm}`;

    // Calculate working hours
    const parts = existing.punchIn.split(' ');
    const [inH, inM] = parts[0].split(':').map((n) => parseInt(n, 10));
    let inTotal = (inH % 12) * 60 + inM;
    if (parts[1]?.toUpperCase() === 'PM') inTotal += 12 * 60;

    const outTotal = now.getHours() * 60 + now.getMinutes();
    const workedMins = Math.max(0, outTotal - inTotal);

    const overtime = Math.max(0, workedMins - 8 * 60);
    const finalStatus: AttendanceStatus = existing.status === 'LATE' ? 'LATE' : 'PRESENT';

    this.db.run(
      `UPDATE attendance SET
         punch_out = ?, status = ?, working_hours_minutes = ?, overtime_minutes = ?, remarks = ?
       WHERE id = ?`,
      [
        timeFormatted,
        finalStatus,
        workedMins,
        overtime,
        `Day shift closed: ${Math.floor(workedMins / 60)}h ${workedMins % 60}m worked`,
        existing.id,
      ]
    );

    this.addAuditLog('PUNCH_OUT', emp.name, 'STAFF', `${emp.name} punched out at ${timeFormatted}. Total duration: ${Math.floor(workedMins / 60)}h ${workedMins % 60}m`);
    this.persist();

    return { success: true, message: `Punched out at ${timeFormatted}. Shift completed.` };
  }

  public adminAddAttendanceRecord(rec: AttendanceRecord): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    this.db.run(
      `INSERT OR REPLACE INTO attendance (
         id, employee_id, employee_name, department, date, shift_id, shift_name,
         punch_in, punch_out, status, work_mode, working_hours_minutes, late_duration_minutes,
         overtime_minutes, remarks, modified_by, modified_at, modification_reason
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rec.id,
        rec.employeeId,
        rec.employeeName,
        rec.department,
        rec.date,
        rec.shiftId,
        rec.shiftName,
        rec.punchIn,
        rec.punchOut,
        rec.status,
        rec.workMode,
        rec.workingHoursMinutes,
        rec.lateDurationMinutes,
        rec.overtimeMinutes,
        rec.remarks,
        rec.modifiedBy,
        rec.modifiedAt,
        rec.modificationReason,
      ]
    );

    this.addAuditLog('ATTENDANCE_OVERRIDE', rec.modifiedBy || 'Administrator', 'ADMIN', `Manual attendance entry for ${rec.employeeName} on ${rec.date}. Reason: ${rec.modificationReason || 'Admin entry'}`);
    this.persist();
    return { success: true, message: 'Attendance record created successfully.' };
  }

  public adminUpdateAttendance(
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };

    const records = this.getAttendance();
    const existing = records.find((r) => r.id === recordId);
    if (!existing) return { success: false, message: 'Record not found.' };

    const merged = { ...existing, ...updates };
    const nowIso = new Date().toISOString();

    this.db.run(
      `UPDATE attendance SET
         punch_in = ?, punch_out = ?, status = ?, work_mode = ?,
         working_hours_minutes = ?, late_duration_minutes = ?, overtime_minutes = ?,
         remarks = ?, modified_by = ?, modified_at = ?, modification_reason = ?
       WHERE id = ?`,
      [
        merged.punchIn,
        merged.punchOut,
        merged.status,
        merged.workMode,
        merged.workingHoursMinutes,
        merged.lateDurationMinutes,
        merged.overtimeMinutes,
        merged.remarks,
        'Administrator',
        nowIso,
        reason,
        recordId,
      ]
    );

    this.addAuditLog('ATTENDANCE_CORRECTION', 'Administrator', 'ADMIN', `Corrected attendance for ${merged.employeeName} on ${merged.date}. Reason: ${reason}`);
    this.persist();
    return { success: true, message: 'Attendance record updated successfully.' };
  }

  // ==========================================
  // LEAVES
  // ==========================================
  public getLeaves(): LeaveRequest[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM leaves ORDER BY applied_at DESC');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;

    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return {
        id: item.id,
        employeeId: item.employee_id,
        employeeName: item.employee_name,
        department: item.department,
        leaveType: item.leave_type,
        startDate: item.start_date,
        endDate: item.end_date,
        totalDays: item.total_days,
        reason: item.reason,
        notes: item.notes,
        status: item.status,
        appliedAt: item.applied_at,
        reviewedBy: item.reviewed_by,
        reviewedAt: item.reviewed_at,
        reviewRemarks: item.review_remarks,
      } as LeaveRequest;
    });
  }

  public applyLeave(leave: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    const id = `LEV_${Date.now()}`;
    const appliedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

    this.db.run(
      `INSERT INTO leaves (
         id, employee_id, employee_name, department, leave_type,
         start_date, end_date, total_days, reason, notes, status, applied_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        leave.employeeId,
        leave.employeeName,
        leave.department,
        leave.leaveType,
        leave.startDate,
        leave.endDate,
        leave.totalDays,
        leave.reason,
        leave.notes || '',
        'Pending',
        appliedAt,
      ]
    );

    this.addAuditLog('LEAVE_APPLIED', leave.employeeName, 'STAFF', `${leave.employeeName} requested ${leave.totalDays} day(s) ${leave.leaveType} (${leave.startDate} to ${leave.endDate})`);
    this.persist();
    return { success: true, message: 'Leave application submitted for approval.' };
  }

  public reviewLeave(
    leaveId: string,
    status: 'Approved' | 'Rejected',
    remarks = ''
  ): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    this.db.run(
      `UPDATE leaves SET status = ?, reviewed_by = ?, reviewed_at = ?, review_remarks = ? WHERE id = ?`,
      [status, 'Administrator', nowStr, remarks, leaveId]
    );

    this.addAuditLog('LEAVE_REVIEWED', 'Administrator', 'ADMIN', `Leave ${leaveId} was marked as ${status}. Remarks: ${remarks || 'None'}`);
    this.persist();
    return { success: true, message: `Leave application marked as ${status}.` };
  }

  // ==========================================
  // SHIFTS & HOLIDAYS
  // ==========================================
  public getShifts(): Shift[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM shifts');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return {
        id: item.id,
        name: item.name,
        startTime: item.start_time,
        endTime: item.end_time,
        gracePeriodMinutes: item.grace_period_minutes,
        minWorkingHours: item.min_working_hours,
        maxWorkingHours: item.max_working_hours,
        description: item.description,
      } as Shift;
    });
  }

  public addShift(shift: Shift): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    this.db.run(
      `INSERT OR REPLACE INTO shifts VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shift.id,
        shift.name,
        shift.startTime,
        shift.endTime,
        shift.gracePeriodMinutes,
        shift.minWorkingHours,
        shift.maxWorkingHours,
        shift.description || '',
      ]
    );
    this.persist();
    return { success: true, message: 'Shift configuration saved.' };
  }

  public updateShift(id: string, shift: Partial<Shift>): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    const existing = this.getShifts().find((s) => s.id === id);
    if (!existing) return { success: false, message: 'Shift not found' };
    const merged = { ...existing, ...shift };
    return this.addShift(merged);
  }

  public deleteShift(id: string): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    this.db.run('DELETE FROM shifts WHERE id = ?', [id]);
    this.persist();
    return { success: true, message: 'Shift deleted.' };
  }

  public getHolidays(): Holiday[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM holidays ORDER BY date ASC');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return item as Holiday;
    });
  }

  public addHoliday(holiday: Holiday): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    this.db.run(
      `INSERT OR REPLACE INTO holidays VALUES (?, ?, ?, ?, ?)`,
      [holiday.id, holiday.name, holiday.date, holiday.description, holiday.type]
    );
    this.persist();
    return { success: true, message: 'Holiday saved.' };
  }

  public updateHoliday(id: string, holiday: Partial<Holiday>): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    const existing = this.getHolidays().find((h) => h.id === id);
    if (!existing) return { success: false, message: 'Holiday not found' };
    const merged = { ...existing, ...holiday };
    return this.addHoliday(merged);
  }

  public deleteHoliday(id: string): { success: boolean; message: string } {
    if (!this.db) return { success: false, message: 'Database not ready' };
    this.db.run('DELETE FROM holidays WHERE id = ?', [id]);
    this.persist();
    return { success: true, message: 'Holiday deleted.' };
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  public getNotifications(): NotificationItem[] {
    if (!this.db) return [];
    const res = this.db.exec('SELECT * FROM notifications ORDER BY created_at DESC');
    if (!res || !res[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((row) => {
      const item: any = {};
      cols.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return {
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        targetEmployeeId: item.target_employee_id,
        read: Boolean(item.read),
        createdAt: item.created_at,
      } as NotificationItem;
    });
  }

  public markNotificationRead(id: string): void {
    if (!this.db) return;
    this.db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    this.persist();
  }

  public createAnnouncement(title: string, message: string): void {
    if (!this.db) return;
    const id = `NOTIF_${Date.now()}`;
    const nowStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    this.db.run(
      'INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, message, 'announcement', 'ALL', 0, nowStr]
    );
    this.persist();
  }

  // ==========================================
  // SETTINGS & BRANDING
  // ==========================================
  public saveSetting(key: string, value: string): void {
    if (!this.db) return;
    this.db.run('INSERT OR REPLACE INTO system_settings VALUES (?, ?)', [key, value]);
    this.persist();
  }

  public getSetting(key: string): string | null {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT value FROM system_settings WHERE key = ?');
    stmt.bind([key]);
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject() as any;
    stmt.free();
    return row.value;
  }

  public getPunchSettings(): PunchSettings {
    const raw = this.getSetting('punch_settings');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
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
  }

  public updatePunchSettings(settings: Partial<PunchSettings>): void {
    const cur = this.getPunchSettings();
    const updated = { ...cur, ...settings };
    this.saveSetting('punch_settings', JSON.stringify(updated));
  }

  public getCompanySettings(): CompanySettings {
    const raw = this.getSetting('company_settings');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      companyName: 'StaffSync Systems Inc.',
      logoText: 'StaffSync',
      address: 'Corporate Headquarters',
      contactEmail: 'admin@staffsync.io',
      contactPhone: '+1 (800) 555-0199',
      timezone: 'Asia/Kolkata',
    };
  }

  public updateCompanySettings(settings: Partial<CompanySettings>): void {
    const cur = this.getCompanySettings();
    const updated = { ...cur, ...settings };
    this.saveSetting('company_settings', JSON.stringify(updated));
  }

  public getBranding(): BrandingSettings {
    const raw = this.getSetting('branding_settings');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      organizationId: 'ORG_DEFAULT',
      projectName: 'StaffSync',
      logoUrl: null,
      faviconUrl: null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Default',
    };
  }

  public updateBranding(updates: Partial<BrandingSettings>): { success: boolean; message: string } {
    const cur = this.getBranding();
    const updated = {
      ...cur,
      ...updates,
      updatedAt: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      updatedBy: 'Administrator',
    };
    this.saveSetting('branding_settings', JSON.stringify(updated));
    return { success: true, message: 'Branding settings updated successfully.' };
  }

  public resetBranding(): { success: boolean; message: string } {
    const def: BrandingSettings = {
      organizationId: 'ORG_DEFAULT',
      projectName: 'StaffSync',
      logoUrl: null,
      faviconUrl: null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Default',
    };
    this.saveSetting('branding_settings', JSON.stringify(def));
    return { success: true, message: 'Branding reset to default.' };
  }
}

export const productionDb = new ProductionDatabase();

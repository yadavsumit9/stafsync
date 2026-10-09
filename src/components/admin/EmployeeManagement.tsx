import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Eye,
  CheckCircle2,
  XCircle,
  Building,
  Briefcase,
  Phone,
  Mail,
  Shield,
  X,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Employee, WorkMode } from '../../types';
import { DigitalIdCard } from '../common/DigitalIdCard';

export const EmployeeManagement: React.FC = () => {
  const {
    employees,
    shifts,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
    toggleFlexibleWorkMode,
  } = useAttendance();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [resetPassEmp, setResetPassEmp] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Add Employee Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '1995-05-20',
    address: '',
    emergencyContact: '',
    department: 'Engineering',
    position: 'Software Engineer',
    designation: 'Developer',
    joiningDate: '2026-10-01',
    employmentType: 'Full Time' as 'Full Time' | 'Part Time' | 'Contract' | 'Intern',
    shiftId: 'SHIFT_GEN',
    defaultWorkMode: 'OFFICE' as WorkMode,
    allowFlexibleWorkMode: false,
    weeklyOffDays: ['Sunday', 'Saturday'],
    status: 'Active' as 'Active' | 'Inactive',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const departments = ['Engineering', 'Design', 'Operations', 'Human Resources', 'Marketing', 'Finance'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Please fill in required fields (Name, Email, Phone).');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    const res = addEmployee(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address || 'Company Headquarters',
        emergencyContact: formData.emergencyContact || 'Pending Submission',
        department: formData.department,
        position: formData.position,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        employmentType: formData.employmentType,
        shiftId: formData.shiftId,
        defaultWorkMode: formData.defaultWorkMode,
        allowFlexibleWorkMode: formData.allowFlexibleWorkMode,
        weeklyOffDays: formData.weeklyOffDays,
        status: formData.status,
        accountUsername: formData.email.split('@')[0],
      },
      formData.password
    );

    if (res.success) {
      setSuccessToast(`Account created for ${formData.name} (${res.employeeId})!`);
      setTimeout(() => setSuccessToast(''), 4000);
      setShowAddModal(false);
      // reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '1995-05-20',
        address: '',
        emergencyContact: '',
        department: 'Engineering',
        position: 'Software Engineer',
        designation: 'Developer',
        joiningDate: new Date().toISOString().slice(0, 10),
        employmentType: 'Full Time',
        shiftId: 'SHIFT_GEN',
        defaultWorkMode: 'OFFICE',
        allowFlexibleWorkMode: false,
        weeklyOffDays: ['Sunday', 'Saturday'],
        status: 'Active',
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormError(res.message);
    }
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const res = updateEmployee(editingEmployee.id, editingEmployee);
    if (res.success) {
      setSuccessToast(`Employee profile updated successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setEditingEmployee(null);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassEmp || !newPassword.trim()) return;

    const res = resetEmployeePassword(resetPassEmp.id, newPassword);
    if (res.success) {
      setSuccessToast(`Password updated for ${resetPassEmp.name}`);
      setTimeout(() => setSuccessToast(''), 4000);
      setResetPassEmp(null);
      setNewPassword('');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Manage organization members, credentials, and work schedules ({employees.length} total)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-all shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Employee</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-[#087A4B] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Table or Empty State (Requirement 16) */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#087A4B] flex items-center justify-center mx-auto border border-emerald-200">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">No employees yet.</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first employee to start managing attendance.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department & Role</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Shift</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No employees found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                filteredEmployees.map((emp) => {
                  const shift = shifts.find((s) => s.id === emp.shiftId);
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#087A4B] font-bold flex items-center justify-center text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block group-hover:text-[#087A4B] transition-colors">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{emp.employmentType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        {emp.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 block">{emp.department}</span>
                        <span className="text-[11px] text-slate-400">{emp.position}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 block">{emp.email}</span>
                        <span className="text-[11px] text-slate-400">{emp.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {shift ? shift.name : 'General Shift'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium block w-fit">
                            {emp.defaultWorkMode}
                          </span>
                          {emp.allowFlexibleWorkMode ? (
                            <button
                              onClick={() => {
                                toggleFlexibleWorkMode(emp.id, false);
                                setSuccessToast(`Revoked flexible work mode for ${emp.name}`);
                                setTimeout(() => setSuccessToast(''), 3000);
                              }}
                              title="Click to lock work mode to default"
                              className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#087A4B]" />
                              <span>Flexible (Anywhere)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                toggleFlexibleWorkMode(emp.id, true);
                                setSuccessToast(`Allowed work from anywhere for ${emp.name}`);
                                setTimeout(() => setSuccessToast(''), 3000);
                              }}
                              title="Click to allow work from anywhere"
                              className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md font-medium transition-colors cursor-pointer"
                            >
                              <Lock className="w-2.5 h-2.5 text-slate-400" />
                              <span>Fixed Only</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {emp.joiningDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{emp.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Digital ID"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setResetPassEmp(emp)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove employee ${emp.name} (${emp.id})?`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Digital ID View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Digital Identity Card</h3>
              <button
                onClick={() => setViewingEmployee(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DigitalIdCard
              employee={viewingEmployee}
              shift={shifts.find((s) => s.id === viewingEmployee.shiftId)}
            />
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Employee Portal Access: Active</span>
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Reset Credentials</h3>
              </div>
              <button
                onClick={() => setResetPassEmp(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Set a new password for <strong>{resetPassEmp.name}</strong> ({resetPassEmp.id}).
              </p>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min 8 chars)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassEmp(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Multi-Section Modal (Requirement 9) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500">
                  Provision workforce credentials, assigned shift, and digital ID
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="mt-5 space-y-6 text-xs">
              {/* SECTION 1: Personal Information */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#087A4B]" />
                  1. Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Patil"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul.patil@staffsync.io"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98201 44521"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="+91 98201 99882 (Spouse/Parent)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Employment Information */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#087A4B]" />
                  2. Employment & Shift Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Position / Title</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g. Senior Frontend Developer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assigned Shift</label>
                    <select
                      value={formData.shiftId}
                      onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Default Work Mode</label>
                    <select
                      value={formData.defaultWorkMode}
                      onChange={(e) => setFormData({ ...formData, defaultWorkMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="OFFICE">OFFICE</option>
                      <option value="WORK FROM HOME">WORK FROM HOME</option>
                      <option value="HYBRID">HYBRID</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#087A4B]" />
                        Allow Work From Anywhere (Flexible Location Mode)
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        If enabled, this employee can freely select Office, Work From Home, or Hybrid at punch-in.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.allowFlexibleWorkMode}
                        onChange={(e) =>
                          setFormData({ ...formData, allowFlexibleWorkMode: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#087A4B]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Account Credentials */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#087A4B]" />
                  3. Account Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Employee & Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Employee: {editingEmployee.name}
              </h3>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, department: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Position</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, position: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Shift</label>
                  <select
                    value={editingEmployee.shiftId}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, shiftId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Work Mode</label>
                  <select
                    value={editingEmployee.defaultWorkMode}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        defaultWorkMode: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="OFFICE">OFFICE</option>
                    <option value="WORK FROM HOME">WORK FROM HOME</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#087A4B]" />
                    Allow Work From Anywhere (Flexible Location Mode)
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    When enabled, this employee can choose between Office, WFH, or Hybrid on Punch-In.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editingEmployee.allowFlexibleWorkMode)}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        allowFlexibleWorkMode: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#087A4B]"></div>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A4B] text-white rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

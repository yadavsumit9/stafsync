import React, { useState } from 'react';
import {
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  Shield,
  Edit2,
  CheckCircle2,
  Lock,
  Printer,
  LogOut,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { DigitalIdCard } from '../common/DigitalIdCard';

export const StaffProfile: React.FC = () => {
  const { currentUser, employees, shifts, updateEmployee, logout } = useAttendance();

  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees[0];

  const assignedShift = shifts.find((s) => s.id === currentEmp?.shiftId);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [phone, setPhone] = useState(currentEmp?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(currentEmp?.emergencyContact || '');
  const [address, setAddress] = useState(currentEmp?.address || '');
  const [toastMsg, setToastMsg] = useState('');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    updateEmployee(currentEmp.id, {
      phone,
      emergencyContact,
      address,
    });

    setToastMsg('Contact details updated successfully!');
    setTimeout(() => setToastMsg(''), 3500);
    setIsEditingContact(false);
  };

  if (!currentEmp) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Profile Assigned</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account is logged in as Staff, but does not have a linked employee record. Contact your Administrator to assign your profile.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in pb-24 lg:pb-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
            My Employee Profile & Credentials
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Verified organization identification pass and employment record
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Digital Pass</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Digital ID Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Official Organization ID</h3>
            <DigitalIdCard employee={currentEmp} shift={assignedShift} />
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Shield className="w-4 h-4 text-[#087A4B]" />
              <span>Security Clearance Verified</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              This credential is cryptographically tied to biometric access checkpoints at Company
              Facilities. Show this card at reception or use RFID scanners.
            </p>
          </div>
        </div>

        {/* Right: Personal & Employment Record */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sensitive Employment Info (Locked) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Employment Information</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Managed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Employee ID</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{currentEmp.id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-bold text-slate-900">{currentEmp.department}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Designation</span>
                <span className="font-bold text-slate-900">
                  {currentEmp.designation || currentEmp.position}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Assigned Shift</span>
                <span className="font-bold text-slate-900">
                  {currentEmp?.shiftStartTime && currentEmp?.shiftEndTime
                    ? `Manual Timing (${currentEmp.shiftStartTime} - ${currentEmp.shiftEndTime})`
                    : assignedShift
                    ? `${assignedShift.name} (${assignedShift.startTime} - ${assignedShift.endTime})`
                    : 'General Shift'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Joining Date</span>
                <span className="font-bold text-slate-900 font-mono">{currentEmp.joiningDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Default Work Mode</span>
                <span className="font-bold text-slate-900">{currentEmp.defaultWorkMode || 'OFFICE'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Employment Type</span>
                <span className="font-bold text-slate-900">{currentEmp.employmentType}</span>
              </div>
            </div>
          </div>

          {/* Contact Details (Editable by staff if permitted) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Contact & Emergency Details</h3>
              {!isEditingContact && (
                <button
                  onClick={() => setIsEditingContact(true)}
                  className="text-xs font-semibold text-[#087A4B] hover:text-[#065A37] flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Contact</span>
                </button>
              )}
            </div>

            {!isEditingContact ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Corporate Email</span>
                  <span className="font-semibold text-slate-900">{currentEmp.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Phone Number</span>
                  <span className="font-semibold text-slate-900">{currentEmp.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Residential Address</span>
                  <span className="font-semibold text-slate-900">{currentEmp.address}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Emergency Contact</span>
                  <span className="font-semibold text-slate-900">{currentEmp.emergencyContact}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#087A4B] text-white rounded-xl font-semibold shadow-xs"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Session & Sign Out */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Account Session</h4>
                <p className="text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-700">{currentEmp.name}</span> ({currentEmp.id})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to sign out of <strong>{currentEmp?.name}</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

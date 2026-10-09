import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Bell,
  Smartphone,
  Sparkles,
  KeyRound,
  UserCheck,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { PunchSettings, CompanySettings } from '../../types';
import { BrandingSettingsCard } from './BrandingSettingsCard';

interface SettingsViewProps {
  initialTab?: 'punch' | 'general' | 'security' | 'branding';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'punch' }) => {
  const {
    punchSettings,
    updatePunchSettings,
    companySettings,
    updateCompanySettings,
    getAdminSecurityProfile,
    changeAdminId,
    changeAdminPassword,
    logoutOtherSessions,
  } = useAttendance();

  const [activeTab, setActiveTab] = useState<'punch' | 'general' | 'security' | 'branding'>(
    initialTab
  );

  // Form states
  const [localPunch, setLocalPunch] = useState<PunchSettings>({ ...punchSettings });
  const [localCompany, setLocalCompany] = useState<CompanySettings>({ ...companySettings });
  const [saveToast, setSaveToast] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Admin Account Security State
  const adminProfile = getAdminSecurityProfile();

  // Change Admin ID Modal
  const [showChangeIdModal, setShowChangeIdModal] = useState(false);
  const [newAdminIdInput, setNewAdminIdInput] = useState('');

  // Change Admin Password Modal
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSavePunch = (e: React.FormEvent) => {
    e.preventDefault();
    updatePunchSettings(localPunch);
    setSaveToast('Punch policies and timing restrictions saved successfully!');
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(localCompany);
    setSaveToast('Organization profile saved successfully!');
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleSaveAdminId = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = changeAdminId(newAdminIdInput);
    if (res.success) {
      setSaveToast(res.message);
      setShowChangeIdModal(false);
      setNewAdminIdInput('');
      setTimeout(() => setSaveToast(''), 3500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSaveAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = changeAdminPassword(currentPassInput, newPassInput, confirmPassInput);
    if (res.success) {
      setSaveToast(res.message);
      setShowChangePassModal(false);
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      setTimeout(() => setSaveToast(''), 3500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleLogoutOtherSessions = () => {
    const res = logoutOtherSessions();
    setSaveToast(res.message);
    setTimeout(() => setSaveToast(''), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
          System & Security Settings
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          Configure organization rules, biometric timing limits, credentials, and admin security
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold flex-wrap">
        <button
          onClick={() => setActiveTab('punch')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'punch'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Punch Restrictions & Timing Rules
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Admin Account Security</span>
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Organization Profile & Timezone
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Branding</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECURITY & ADMIN ACCOUNT SECURITY TAB (Requirements 5, 6, 7) */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Dedicated ADMIN ACCOUNT SECURITY Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#087A4B] border border-emerald-200 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
                    ADMIN ACCOUNT SECURITY
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Production credential management, administrative identity, and active session controls
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Account Status: {adminProfile?.accountStatus || 'Active'}</span>
                </span>
              </div>
            </div>

            {/* Account Details Grid (Requirement 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Admin ID
                </span>
                <div className="mt-1.5 font-mono text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{adminProfile?.adminId || 'ADM-7X4Q9M2K'}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Primary login identifier</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <div className="mt-1.5 font-semibold text-sm text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{adminProfile?.accountStatus || 'Active'}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Full Super-Admin privileges</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Last Login
                </span>
                <div className="mt-1.5 font-mono text-xs font-semibold text-slate-800 truncate" title={adminProfile?.lastLogin || 'Recent'}>
                  {adminProfile?.lastLogin ? new Date(adminProfile.lastLogin).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : 'Current Session'}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Verified via password hash</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Password Last Changed
                </span>
                <div className="mt-1.5 font-mono text-xs font-semibold text-slate-800 truncate">
                  {adminProfile?.passwordLastChanged
                    ? new Date(adminProfile.passwordLastChanged).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })
                    : adminProfile?.mustChangePassword
                    ? 'Temporary Password Active'
                    : 'Initialized'}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Bcrypt salted hashing</span>
              </div>
            </div>

            {/* Actions Bar (Requirement 7) */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-3">
                Security Actions
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setShowChangeIdModal(true);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Change Admin ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setShowChangePassModal(true);
                  }}
                  className="px-4 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutOtherSessions}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Logout Other Sessions</span>
                </button>
              </div>
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#087A4B]" />
                <span>Zero Plaintext Storage Policy</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Existing passwords are never stored in plaintext and cannot be viewed by any user, API, or console.
                All authentication credentials undergo modern one-way cryptographic salted hashing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PUNCH RESTRICTIONS TAB */}
      {/* ========================================================= */}
      {activeTab === 'punch' && (
        <form onSubmit={handleSavePunch} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#087A4B]" />
                Punch In & Punch Out Master Switches
              </h3>
              <p className="text-xs text-slate-500">
                If disabled, buttons will be locked on staff portals immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Punch In</span>
                  <span className="text-[11px] text-slate-500">Allow staff members to clock-in for work</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPunch.enablePunchIn}
                  onChange={(e) => setLocalPunch({ ...localPunch, enablePunchIn: e.target.checked })}
                  className="w-4 h-4 text-[#087A4B] rounded"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Punch Out</span>
                  <span className="text-[11px] text-slate-500">Allow staff members to clock-out of work</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPunch.enablePunchOut}
                  onChange={(e) => setLocalPunch({ ...localPunch, enablePunchOut: e.target.checked })}
                  className="w-4 h-4 text-[#087A4B] rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Max Punch-In Cutoff Time</label>
                <input
                  type="time"
                  value={localPunch.maxPunchInTime}
                  onChange={(e) => setLocalPunch({ ...localPunch, maxPunchInTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Max Punch-Out Cutoff Time</label>
                <input
                  type="time"
                  value={localPunch.maxPunchOutTime}
                  onChange={(e) => setLocalPunch({ ...localPunch, maxPunchOutTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Grace Period Window (Minutes)</label>
                <input
                  type="number"
                  value={localPunch.gracePeriodMinutes}
                  onChange={(e) => setLocalPunch({ ...localPunch, gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Mark Late Status Automatically</span>
                  <span className="text-[11px] text-slate-500">Calculates delay duration based on shift start + grace</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPunch.markLateAutomatically}
                  onChange={(e) => setLocalPunch({ ...localPunch, markLateAutomatically: e.target.checked })}
                  className="w-4 h-4 text-[#087A4B] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Allow Staff to Select Work Mode</span>
                  <span className="text-[11px] text-slate-500">Permits employee toggle between Office, WFH, and Hybrid</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPunch.allowStaffChangeWorkMode}
                  onChange={(e) => setLocalPunch({ ...localPunch, allowStaffChangeWorkMode: e.target.checked })}
                  className="w-4 h-4 text-[#087A4B] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Allow Multiple Punches Per Day</span>
                  <span className="text-[11px] text-slate-500">Disallow multiple punch cycles by default for security</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPunch.allowMultiplePunches}
                  onChange={(e) => setLocalPunch({ ...localPunch, allowMultiplePunches: e.target.checked })}
                  className="w-4 h-4 text-[#087A4B] rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Punch Rules</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* ORGANIZATION PROFILE TAB */}
      {/* ========================================================= */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveCompany} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Organization Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={localCompany.companyName}
                  onChange={(e) => setLocalCompany({ ...localCompany, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Brand Logo Text</label>
                <input
                  type="text"
                  value={localCompany.logoText}
                  onChange={(e) => setLocalCompany({ ...localCompany, logoText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Timezone</label>
                <input
                  type="text"
                  value={localCompany.timezone}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 outline-none cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Configured standard timezone: Asia/Kolkata (UTC +5:30)
                </span>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corporate Address</label>
                <input
                  type="text"
                  value={localCompany.address}
                  onChange={(e) => setLocalCompany({ ...localCompany, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Organization Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* BRANDING TAB */}
      {/* ========================================================= */}
      {activeTab === 'branding' && <BrandingSettingsCard />}

      {/* ========================================================= */}
      {/* CHANGE ADMIN ID MODAL (Requirement 5 & 9) */}
      {/* ========================================================= */}
      {showChangeIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-1">Change Admin ID</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update the unique administrative login username. The ID must be unique and contain no dangerous characters.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminId} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Current Admin ID</label>
                <input
                  type="text"
                  disabled
                  value={adminProfile?.adminId || 'ADM-7X4Q9M2K'}
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Admin ID</label>
                <input
                  type="text"
                  value={newAdminIdInput}
                  onChange={(e) => setNewAdminIdInput(e.target.value)}
                  placeholder="e.g. ADM-CORP-01"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:border-[#087A4B] outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Allowed characters: letters, numbers, hyphens, and underscores. Min 4 characters.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangeIdModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHANGE ADMIN PASSWORD MODAL (Requirement 6) */}
      {/* ========================================================= */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-1">Change Admin Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your current password and choose a strong new password meeting security standards.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminPass} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#087A4B] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Minimum 12 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#087A4B] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#087A4B] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <span className="font-semibold text-slate-700 block">Requirements:</span>
                <span>Minimum 12 characters, uppercase, lowercase, numbers, and special symbol.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

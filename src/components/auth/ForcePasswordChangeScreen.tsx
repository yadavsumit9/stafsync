import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { ProjectLogo } from '../common/ProjectLogo';
import { validatePasswordStrength } from '../../utils/cryptoSecurity';

export const ForcePasswordChangeScreen: React.FC = () => {
  const { adminAccount, updateInitialAdminPassword, logout, branding } = useAttendance();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Live password validation criteria
  const hasMinLength = newPassword.length >= 12;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage('Please enter your temporary current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('New password cannot be the same as the temporary password.');
      return;
    }

    const valResult = validatePasswordStrength(newPassword);
    if (!valResult.valid) {
      setErrorMessage(valResult.message || 'Password does not meet enterprise security requirements.');
      return;
    }

    setIsSubmitting(true);
    const res = updateInitialAdminPassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Password updated successfully! Redirecting to Admin Panel...');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#087A4B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative z-10 animate-in fade-in zoom-in-95">
        {/* Brand / Logo Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
          <ProjectLogo size="md" variant="badge" className="mb-3 shadow-xs" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>First-Time Security Onboarding</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Check</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            For your security, please change your temporary Admin password before continuing.
          </p>
        </div>

        {/* Admin ID Badge */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Logged in as Administrator</span>
            <span className="font-mono font-bold text-slate-900">{adminAccount?.id}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
            Password Reset Required
          </span>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification banner */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Current Temporary Password */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current temporary password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password (min. 12 chars)"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Security Rules Checklist */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
            <span className="font-semibold text-slate-700 block text-[11px] mb-1">
              Password Security Standards:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-slate-600">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 12 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Numeric digit (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Special char (!@#$%)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : ''}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[46px] py-2.5 bg-[#087A4B] hover:bg-[#065A37] disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full min-h-[40px] py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancel & Sign Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

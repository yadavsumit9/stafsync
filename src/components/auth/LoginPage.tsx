import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  X,
  Sparkles,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

interface LoginPageProps {
  onSuccess: (role: 'admin' | 'staff') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAttendance();

  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrId.trim() || !password.trim()) {
      setErrorMessage('Please enter both Employee ID and Password.');
      return;
    }

    const res = login(usernameOrId, password);
    if (res.success && res.role) {
      onSuccess(res.role);
    } else {
      setErrorMessage(res.message || 'Invalid credentials. Please verify your ID and password.');
    }
  };

  const handleQuickLogin = (id: string, pass: string) => {
    setUsernameOrId(id);
    setPassword(pass);
    const res = login(id, pass);
    if (res.success && res.role) {
      onSuccess(res.role);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#087A4B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative z-10 animate-in fade-in zoom-in-95">
        {/* Brand Header matching reference aesthetics */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#087A4B] to-[#044D2F] flex items-center justify-center text-white shadow-md mb-3">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            StaffSync Attendance OS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Workforce & Biometric Management System
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Unified Sign-In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Employee ID or Admin ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usernameOrId}
                onChange={(e) => setUsernameOrId(e.target.value)}
                placeholder="e.g. ADMIN001 or EMP002"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#087A4B] hover:text-[#065A37]"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#087A4B] focus:ring-[#087A4B]"
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Sign In to System</span>
          </button>
        </form>

        {/* 1-Click Demo Accounts Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1-Click Instant Demo Login:
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">Password: prefilled</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('ADMIN001', 'admin123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-[#087A4B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] text-slate-600 block mt-0.5">ADMIN001 (Devendra)</span>
            </button>

            <button
              onClick={() => handleQuickLogin('EMP002', 'staff123')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5" />
                <span>Staff: Janhavi Dev</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">EMP002 (Designer)</span>
            </button>

            <button
              onClick={() => handleQuickLogin('EMP001', 'staff123')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5" />
                <span>Staff: Rahul Patil</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">EMP001 (Developer)</span>
            </button>

            <button
              onClick={() => handleQuickLogin('EMP003', 'staff123')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5" />
                <span>Staff: Amit Sharma</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">EMP003 (Operations)</span>
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-5 text-center text-[11px] text-slate-400">
          <span>Self-registration is closed. Accounts are provisioned exclusively by HR Admin.</span>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Password Recovery</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {!forgotSent ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Please enter your registered Employee ID or email to submit a secure recovery request
                  to your HR Administrator.
                </p>
                <input
                  type="text"
                  placeholder="Employee ID or Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2 bg-[#087A4B] text-white rounded-xl font-bold"
                >
                  Send Reset Request
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-center py-2">
                <CheckCircle2 className="w-8 h-8 text-[#087A4B] mx-auto" />
                <p className="font-semibold text-slate-900">Reset Request Dispatched</p>
                <p className="text-slate-500">
                  HR Administration has received your reset request. Default demo passwords remain{' '}
                  <code className="text-emerald-700 font-mono">admin123</code> or{' '}
                  <code className="text-emerald-700 font-mono">staff123</code>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

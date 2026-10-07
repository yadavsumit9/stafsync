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
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { PunchSettings, CompanySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { punchSettings, updatePunchSettings, companySettings, updateCompanySettings } =
    useAttendance();

  const [activeTab, setActiveTab] = useState<'punch' | 'general' | 'security'>('punch');

  // Form states
  const [localPunch, setLocalPunch] = useState<PunchSettings>({ ...punchSettings });
  const [localCompany, setLocalCompany] = useState<CompanySettings>({ ...companySettings });
  const [saveToast, setSaveToast] = useState('');

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System & Punch Policy Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure organization rules, biometric timing limits, grace windows, and permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('punch')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'punch'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Punch Restrictions & Timing Rules
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'general'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Organization Profile & Timezone
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Access & Security Rules
        </button>
      </div>

      {activeTab === 'punch' && (
        /* PUNCH RULES FORM (Requirement 13) */
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
              {/* Enable Punch In Switch */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Punch In</span>
                  <span className="text-[11px] text-slate-500">
                    Allow staff members to clock-in for work
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPunch.enablePunchIn}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, enablePunchIn: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087A4B]"></div>
                </label>
              </div>

              {/* Enable Punch Out Switch */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Punch Out</span>
                  <span className="text-[11px] text-slate-500">
                    Allow staff members to punch out to conclude their shift
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPunch.enablePunchOut}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, enablePunchOut: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087A4B]"></div>
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Timing cutoffs */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Daily Timing Windows & Cutoffs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Maximum Punch-In Cutoff (24h)
                  </label>
                  <input
                    type="time"
                    value={localPunch.maxPunchInTime}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, maxPunchInTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Punch-in disables after this time if late entry is disallowed
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Maximum Punch-Out Time (24h)
                  </label>
                  <input
                    type="time"
                    value={localPunch.maxPunchOutTime}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, maxPunchOutTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Auto-shift cutoff threshold for night shift
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Grace Buffer Period (Minutes)
                  </label>
                  <input
                    type="number"
                    value={localPunch.gracePeriodMinutes}
                    onChange={(e) =>
                      setLocalPunch({
                        ...localPunch,
                        gracePeriodMinutes: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    min={0}
                    max={60}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Arrivals after grace period are marked LATE
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Additional Policy Toggles */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Attendance Automation & Staff Permissions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Mark Late Status Automatically
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Calculates delay duration based on shift start + grace
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPunch.markLateAutomatically}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, markLateAutomatically: e.target.checked })
                    }
                    className="w-4 h-4 text-[#087A4B] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Allow Staff to Select Work Mode
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Permits employee toggle between Office, WFH, and Hybrid
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPunch.allowStaffChangeWorkMode}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, allowStaffChangeWorkMode: e.target.checked })
                    }
                    className="w-4 h-4 text-[#087A4B] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Allow Multiple Punches Per Day
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Disallow multiple punch cycles by default for security
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPunch.allowMultiplePunches}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, allowMultiplePunches: e.target.checked })
                    }
                    className="w-4 h-4 text-[#087A4B] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Allow Late Punch-In Submission
                    </span>
                    <span className="text-[11px] text-slate-500">
                      If false, punch-in locks completely after cutoff window
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPunch.allowLatePunchIn}
                    onChange={(e) =>
                      setLocalPunch({ ...localPunch, allowLatePunchIn: e.target.checked })
                    }
                    className="w-4 h-4 text-[#087A4B] rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Punch Rules</span>
              </button>
            </div>
          </div>
        </form>
      )}

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
                  onChange={(e) =>
                    setLocalCompany({ ...localCompany, companyName: e.target.value })
                  }
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
                className="px-5 py-2.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Organization Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            Security & Immutability Directives
          </h3>
          <p className="text-slate-600 leading-relaxed">
            The Staff Attendance Management System implements strict role-based access control (RBAC).
            Employees cannot tamper with clock-in/out timestamps or retroactively falsify work modes.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Strict Audit Trail</span>
              <span className="text-slate-500 text-[11px]">
                Every manual correction by an administrator records Administrator Name, Modification Date,
                and Reason in the permanent audit trail.
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Password & Credential Protection</span>
              <span className="text-slate-500 text-[11px]">
                Employee accounts can only be provisioned and reset by authorized HR Administrators.
                No public sign-up surface is accessible.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Calendar,
  Building,
  Laptop,
  Building2,
  CalendarDays,
  Shield,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { WorkMode, AttendanceRecord } from '../../types';
import { DigitalIdCard } from '../common/DigitalIdCard';

interface StaffDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenLeaveModal: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigate,
  onOpenLeaveModal,
}) => {
  const {
    currentUser,
    employees,
    shifts,
    attendance,
    holidays,
    punchSettings,
    punchIn,
    punchOut,
  } = useAttendance();

  // Find active employee record
  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees.find((e) => e.id === 'EMP002') || // Janhavi Dev fallback
    employees[0];

  const assignedShift = shifts.find((s) => s.id === currentEmp?.shiftId) || shifts[0];

  const todayStr = '2026-10-07';
  const todayRecord = attendance.find(
    (r) => r.employeeId === currentEmp?.id && r.date === todayStr
  );

  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>(
    todayRecord?.workMode || currentEmp?.defaultWorkMode || 'OFFICE'
  );
  const [punchFeedback, setPunchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (todayRecord?.workMode) {
      setSelectedWorkMode(todayRecord.workMode);
    } else if (currentEmp?.defaultWorkMode) {
      setSelectedWorkMode(currentEmp.defaultWorkMode);
    }
  }, [currentEmp?.id, currentEmp?.defaultWorkMode, todayRecord?.workMode]);

  // Live elapsed counter simulation for "WORKING" state
  const [elapsedMinutes, setElapsedMinutes] = useState(todayRecord?.workingHoursMinutes || 270);

  useEffect(() => {
    let interval: any;
    if (todayRecord?.status === 'WORKING') {
      interval = setInterval(() => {
        setElapsedMinutes((prev) => prev + 1);
      }, 60000); // 1 minute ticker
    }
    return () => clearInterval(interval);
  }, [todayRecord?.status]);

  const handlePunchInClick = () => {
    setPunchFeedback(null);
    const res = punchIn(currentEmp.id, selectedWorkMode);
    if (res.success) {
      setPunchFeedback({ type: 'success', message: res.message });
    } else {
      setPunchFeedback({ type: 'error', message: res.message });
    }
  };

  const handlePunchOutClick = () => {
    setPunchFeedback(null);
    const res = punchOut(currentEmp.id);
    if (res.success) {
      setPunchFeedback({ type: 'success', message: res.message });
    } else {
      setPunchFeedback({ type: 'error', message: res.message });
    }
  };

  const formatElapsedTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m < 10 ? '0' + m : m}m`;
  };

  // Recent personal history
  const personalHistory = attendance
    .filter((r) => r.employeeId === currentEmp?.id)
    .slice(0, 5);

  // Next upcoming holiday
  const nextHoliday = holidays.find((h) => h.date >= todayStr) || holidays[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Top Staff Greeting Banner (Requirement 11) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Self-Service Portal
          </span>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight mt-1.5">
            Good Morning, {currentEmp?.name}
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Wednesday, 7 October 2026 · Standard Shift: {assignedShift.startTime} to {assignedShift.endTime}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLeaveModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors"
          >
            Apply Leave
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-colors shadow-xs"
          >
            My Calendar
          </button>
        </div>
      </div>

      {/* Main Grid: Left Digital ID Card + Right Attendance Punch Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Digital ID Card Widget (Requirement 10) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Digital ID Card</h3>
              <span className="text-[10px] text-slate-400 font-mono">STAFFPASS v2</span>
            </div>
            {currentEmp && (
              <DigitalIdCard
                employee={currentEmp}
                shift={assignedShift}
              />
            )}
          </div>

          {/* Quick Schedule Notice */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Assigned Shift & Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Scheduled Hours</span>
                <span className="font-bold text-slate-900 font-mono">
                  {assignedShift.startTime} - {assignedShift.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Grace Buffer</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  15 minutes (until 09:45 AM)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Next Upcoming Holiday</span>
                <span className="font-medium text-purple-700">
                  {nextHoliday.name} ({nextHoliday.date})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: MAIN TODAY'S ATTENDANCE PUNCH CARD (Requirement 11, 12, 13, 14) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Today's Attendance Status
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Wednesday, 7 October 2026
                </h2>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    todayRecord?.status === 'WORKING'
                      ? 'bg-emerald-100 text-[#087A4B] animate-pulse'
                      : todayRecord?.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : todayRecord?.status === 'LATE'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : todayRecord?.status === 'ON LEAVE'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      todayRecord?.status === 'WORKING'
                        ? 'bg-emerald-500'
                        : todayRecord?.status === 'PRESENT'
                        ? 'bg-emerald-500'
                        : todayRecord?.status === 'LATE'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>{todayRecord?.status || 'NOT PUNCHED IN'}</span>
                </span>
              </div>
            </div>

            {/* Work Mode Selector (Per-Employee Admin Permission) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Work Location Mode for Today
                  </label>
                  {currentEmp?.allowFlexibleWorkMode ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#087A4B]" />
                      Work From Anywhere Allowed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Locked: {currentEmp?.defaultWorkMode}
                    </span>
                  )}
                </div>

                {!currentEmp?.allowFlexibleWorkMode && (
                  <span className="text-[10px] text-slate-400">
                    Contact Admin to enable flexible work from anywhere
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {(['OFFICE', 'WORK FROM HOME', 'HYBRID'] as WorkMode[]).map((mode) => {
                  const isAllowed = Boolean(currentEmp?.allowFlexibleWorkMode);
                  const isSelected = isAllowed
                    ? selectedWorkMode === mode
                    : currentEmp?.defaultWorkMode === mode;
                  const isPunched = Boolean(todayRecord && todayRecord.status !== 'NOT PUNCHED IN');
                  const isDisabled = !isAllowed || isPunched;

                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isAllowed && !isPunched) {
                          setSelectedWorkMode(mode);
                        }
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-[#087A4B] text-white border-[#087A4B] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      } ${!isAllowed && !isSelected ? 'opacity-40 cursor-not-allowed bg-slate-100/60' : ''}`}
                    >
                      {mode === 'OFFICE' && <Building2 className="w-3.5 h-3.5" />}
                      {mode === 'WORK FROM HOME' && <Laptop className="w-3.5 h-3.5" />}
                      {mode === 'HYBRID' && <MapPin className="w-3.5 h-3.5" />}
                      <span className="truncate">{mode}</span>
                    </button>
                  );
                })}
              </div>

              {!currentEmp?.allowFlexibleWorkMode && (
                <p className="mt-2 text-[11px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="font-semibold text-slate-700">Notice:</span> Work from home or
                  hybrid selection is restricted for your account. You are assigned to{' '}
                  <strong className="text-slate-900">{currentEmp?.defaultWorkMode}</strong> mode.
                  Admin can enable flexible mode in Employee Management.
                </p>
              )}
            </div>

            {/* Punch Metrics Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Punch-In Recorded</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {todayRecord?.punchIn || '--:--'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Shift start: {assignedShift.startTime}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Current Working Duration</span>
                <span className="text-base font-bold font-mono text-[#087A4B]">
                  {todayRecord?.status === 'WORKING'
                    ? formatElapsedTime(elapsedMinutes)
                    : todayRecord?.workingHoursMinutes
                    ? formatElapsedTime(todayRecord.workingHoursMinutes)
                    : '0h 00m'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Min required: {assignedShift.minWorkingHours}h
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] text-slate-400 block mb-0.5">Punch-Out Time</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {todayRecord?.punchOut || '--:--'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Shift end: {assignedShift.endTime}
                </span>
              </div>
            </div>

            {/* Punch Button & Restrictions */}
            <div className="space-y-3 pt-2">
              {/* Feedback messages */}
              {punchFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    punchFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {punchFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{punchFeedback.message}</span>
                </div>
              )}

              {/* State: Not Punched In */}
              {(!todayRecord || todayRecord.status === 'NOT PUNCHED IN') && (
                <div>
                  {!punchSettings.enablePunchIn ? (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 text-center font-medium">
                      Punch-In is temporarily locked by HR Administrator policy.
                    </div>
                  ) : (
                    <button
                      onClick={handlePunchInClick}
                      className="w-full py-4 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-5 h-5" />
                      <span>CLOCK IN FOR WORK</span>
                    </button>
                  )}
                </div>
              )}

              {/* State: Currently Working */}
              {todayRecord?.status === 'WORKING' && (
                <div>
                  {!punchSettings.enablePunchOut ? (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 text-center font-medium">
                      Punch-Out is disabled by Admin policy. Please contact supervisor.
                    </div>
                  ) : (
                    <button
                      onClick={handlePunchOutClick}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>PUNCH OUT (CONCLUDE SHIFT)</span>
                    </button>
                  )}
                </div>
              )}

              {/* State: Completed / Late / Other */}
              {(todayRecord?.status === 'PRESENT' ||
                todayRecord?.status === 'HALF DAY' ||
                (todayRecord?.status === 'LATE' && todayRecord?.punchOut)) && (
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold block">Attendance Successfully Concluded Today</span>
                      <span className="text-[11px] text-emerald-700">
                        Total logged duration: {formatElapsedTime(todayRecord.workingHoursMinutes)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    FINALIZED
                  </span>
                </div>
              )}

              {/* Immutability Notice (Requirement 47) */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 justify-center">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted attendance records are verified and immutable for employees.</span>
              </div>
            </div>
          </div>

          {/* Recent Attendance History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Personal Logs</h3>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-[#087A4B] hover:text-[#065A37] flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Punch In</th>
                    <th className="py-2.5 px-4">Punch Out</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {personalHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{rec.date}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">{rec.punchIn || '--:--'}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{rec.punchOut || '--:--'}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {rec.workingHoursMinutes > 0 ? formatElapsedTime(rec.workingHoursMinutes) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {rec.workMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-semibold text-[11px] ${
                            rec.status === 'PRESENT'
                              ? 'text-emerald-700'
                              : rec.status === 'WORKING'
                              ? 'text-[#087A4B]'
                              : rec.status === 'LATE'
                              ? 'text-amber-700'
                              : rec.status === 'ON LEAVE'
                              ? 'text-blue-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Laptop,
  MapPin,
  Lock,
  Sparkles,
  Calendar as CalendarIcon,
  Coffee,
  Bell,
  ChevronRight,
  User,
  Shield,
  X,
  Send,
  CalendarDays,
  Info,
  LogOut,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { WorkMode, AttendanceRecord, LeaveType } from '../../types';
import { AttendanceDetailModal } from '../common/AttendanceDetailModal';
import { ProjectLogo } from '../common/ProjectLogo';

interface StaffMobileDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenLeaveModal?: () => void;
}

export const StaffMobileDashboard: React.FC<StaffMobileDashboardProps> = ({
  onNavigate,
}) => {
  const {
    currentUser,
    employees,
    shifts,
    attendance,
    holidays,
    leaves,
    punchSettings,
    punchIn,
    punchOut,
    applyLeave,
    notifications,
    markNotificationRead,
    logout,
    branding,
  } = useAttendance();

  // Active employee
  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees[0];

  const assignedShift =
    shifts.find((s) => s.id === currentEmp?.shiftId) ||
    shifts[0] ||
    null;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const formattedToday = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  const todayRecord = attendance.find(
    (r) => r.employeeId === currentEmp?.id && r.date === todayStr
  );

  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>(
    todayRecord?.workMode || currentEmp?.defaultWorkMode || 'OFFICE'
  );

  // States for interaction & touch feedback
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);
  const [punchSuccessToast, setPunchSuccessToast] = useState<{
    title: string;
    time: string;
    desc: string;
  } | null>(null);
  const [punchErrorMessage, setPunchErrorMessage] = useState<string | null>(null);

  // Modals
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [selectedCalendarRecord, setSelectedCalendarRecord] = useState<AttendanceRecord | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Apply Leave form state
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(todayStr);
  const [leaveEndDate, setLeaveEndDate] = useState(todayStr);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveToast, setLeaveToast] = useState('');

  // Weekly Off detection
  const isTodayWeeklyOff =
    todayRecord?.status === 'WEEK OFF' ||
    Boolean(currentEmp?.weeklyOffDays?.includes(todayDayName));

  // Live timer calculated from server timestamp
  const calculateMobileElapsed = () => {
    if (!todayRecord?.punchIn) return 0;
    if (todayRecord.punchOut && todayRecord.workingHoursMinutes !== undefined) {
      return todayRecord.workingHoursMinutes;
    }
    if (todayRecord.punchInAt) {
      const startMs = new Date(todayRecord.punchInAt).getTime();
      return Math.max(0, Math.floor((Date.now() - startMs) / (1000 * 60)));
    }
    const parts = todayRecord.punchIn.split(' ');
    const [h, m] = parts[0].split(':').map((n) => parseInt(n, 10));
    let startMin = (h % 12) * 60 + m;
    if (parts[1]?.toUpperCase() === 'PM') startMin += 720;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, nowMin - startMin);
  };

  const [elapsedMinutes, setElapsedMinutes] = useState(calculateMobileElapsed());
  const [showMobilePunchOutConfirm, setShowMobilePunchOutConfirm] = useState(false);

  useEffect(() => {
    setElapsedMinutes(calculateMobileElapsed());
    let timer: any;
    if (todayRecord?.punchIn && !todayRecord?.punchOut) {
      timer = setInterval(() => {
        setElapsedMinutes(calculateMobileElapsed());
      }, 10000);
    }
    return () => clearInterval(timer);
  }, [todayRecord?.punchIn, todayRecord?.punchInAt, todayRecord?.punchOut, todayRecord?.status]);

  useEffect(() => {
    if (todayRecord?.workMode) {
      setSelectedWorkMode(todayRecord.workMode);
    } else if (currentEmp?.defaultWorkMode) {
      setSelectedWorkMode(currentEmp.defaultWorkMode);
    }
  }, [currentEmp?.id, currentEmp?.defaultWorkMode, todayRecord?.workMode]);

  // Handlers with double-click protection & loading state
  const handleMobilePunchIn = () => {
    if (isSubmittingPunch) return;
    if (!currentEmp) {
      setPunchErrorMessage('No linked employee record found for your account.');
      return;
    }
    setIsSubmittingPunch(true);
    setPunchErrorMessage(null);
    setPunchSuccessToast(null);

    setTimeout(() => {
      const res = punchIn(currentEmp.id, selectedWorkMode);
      setIsSubmittingPunch(false);

      if (res.success) {
        setPunchSuccessToast({
          title: 'Punch In Successful',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          desc: 'You are now marked as Working.',
        });
        setTimeout(() => setPunchSuccessToast(null), 5000);
      } else {
        setPunchErrorMessage(res.message);
        setTimeout(() => setPunchErrorMessage(null), 5000);
      }
    }, 400);
  };

  const handleMobilePunchOut = () => {
    if (isSubmittingPunch) return;
    setIsSubmittingPunch(true);
    setPunchErrorMessage(null);
    setPunchSuccessToast(null);

    setTimeout(() => {
      const res = punchOut(currentEmp.id);
      setIsSubmittingPunch(false);

      if (res.success) {
        setPunchSuccessToast({
          title: 'Punch Out Successful',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          desc: "Today's attendance has been completed.",
        });
        setTimeout(() => setPunchSuccessToast(null), 5000);
      } else {
        setPunchErrorMessage(res.message);
        setTimeout(() => setPunchErrorMessage(null), 5000);
      }
    }, 400);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    setLeaveSubmitting(true);
    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    const res = applyLeave({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      department: currentEmp.department,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      totalDays: diffDays,
      reason: leaveReason,
      notes: '',
    });

    setLeaveSubmitting(false);
    if (res.success) {
      setLeaveToast('Leave request submitted successfully!');
      setShowApplyLeaveModal(false);
      setLeaveReason('');
      setTimeout(() => setLeaveToast(''), 4000);
    }
  };

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h < 10 ? '0' + h : h}h ${m < 10 ? '0' + m : m}m`;
  };

  // Recent attendance records
  const personalRecords = attendance
    .filter((r) => r.employeeId === currentEmp?.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  // My leaves
  const myLeaves = leaves
    .filter((l) => l.employeeId === currentEmp?.id)
    .slice(0, 3);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mini calendar data for current month (Oct 2026)
  const currentMonthDays = 31;
  const firstDay = 4; // Oct 1, 2026 was Thursday (index 4)

  return (
    <div className="min-h-screen bg-[#F7F8F7] pb-24 text-[#151515] select-none animate-in fade-in">
      {/* ============================================================ */}
      {/* 1. MOBILE HEADER (Compact, modern SaaS layout)              */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E8E7] px-4 py-3 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Left: Company Logo */}
        <div className="flex items-center gap-2">
          <ProjectLogo size="sm" variant="badge" />
          <div>
            <span className="text-sm font-semibold text-[#151515] tracking-tight block leading-tight truncate max-w-[140px]">
              {branding.projectName}
            </span>
            <span className="text-[10px] text-[#6B7280] font-normal leading-none block">
              Good Morning, {currentEmp?.name ? currentEmp.name.split(' ')[0] : (currentUser?.name ? currentUser.name.split(' ')[0] : 'Staff')}
            </span>
          </div>
        </div>

        {/* Right: Notifications, Profile Avatar & Logout */}
        <div className="flex items-center gap-1.5">
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotificationsDrawer(true)}
            className="w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-50 border border-[#E6E8E7] text-slate-600 relative hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl overflow-hidden border border-[#E6E8E7] flex items-center justify-center bg-[#EAF6F0] text-[#087A4B] font-semibold text-xs hover:border-emerald-300 transition-colors"
            aria-label="View profile"
            title="View Profile"
          >
            {currentEmp?.avatar ? (
              <img
                src={currentEmp.avatar}
                alt={currentEmp?.name || 'Staff'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(currentEmp?.name || currentUser?.name || 'ST').slice(0, 2).toUpperCase()}</span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 hover:bg-rose-100 transition-colors"
            aria-label="Sign out"
            title="Log Out of Staff Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Success / Error Toasts */}
      {punchSuccessToast && (
        <div className="fixed top-16 left-4 right-4 z-50 p-3.5 bg-white border border-emerald-300 rounded-2xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#087A4B] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-950">{punchSuccessToast.title}</span>
              <span className="font-mono text-emerald-800 text-[11px] font-medium">
                {punchSuccessToast.time}
              </span>
            </div>
            <p className="text-emerald-700 text-[11px] mt-0.5">{punchSuccessToast.desc}</p>
          </div>
        </div>
      )}

      {punchErrorMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{punchErrorMessage}</span>
        </div>
      )}

      {leaveToast && (
        <div className="fixed top-16 left-4 right-4 z-50 p-3.5 bg-[#087A4B] text-white rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{leaveToast}</span>
        </div>
      )}

      {/* Main Mobile Scrollable Content */}
      <main className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* ============================================================ */}
        {/* 2. MOBILE EMPLOYEE CARD (Compact Digital ID)                */}
        {/* ============================================================ */}
        <section className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EAF6F0] border border-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
              {currentEmp?.avatar ? (
                <img
                  src={currentEmp.avatar}
                  alt={currentEmp?.name || 'Staff'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-[#087A4B]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#151515] leading-tight">
                {currentEmp?.name || currentUser?.name || 'Staff Member'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#6B7280]">
                <span className="font-mono font-medium text-slate-700 text-[11px]">
                  {currentEmp?.id}
                </span>
                <span>·</span>
                <span className="truncate max-w-[140px]">{currentEmp?.designation}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {currentEmp?.department}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="text-[11px] font-semibold text-[#087A4B] bg-[#EAF6F0] hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg shrink-0 min-h-[36px] flex items-center gap-1 transition-colors"
            title="View Digital Pass"
          >
            <span>Pass</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </section>

        {/* ============================================================ */}
        {/* 3 & 4. TODAY'S DATE & TODAY'S ATTENDANCE STATUS CARD         */}
        {/* ============================================================ */}
        <section className="bg-white p-5 rounded-2xl border border-[#E6E8E7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
                Today's Attendance
              </span>
              <h3 className="text-sm font-semibold text-[#151515] mt-0.5">
                {formattedToday}
              </h3>
            </div>

            {/* Current Status Pill */}
            <div>
              {isTodayWeeklyOff ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  WEEK OFF
                </span>
              ) : todayRecord?.status === 'WORKING' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-[#087A4B] border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#087A4B] animate-pulse" />
                  WORKING
                </span>
              ) : todayRecord?.status === 'PRESENT' || (todayRecord?.punchIn && todayRecord?.punchOut) ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  COMPLETED
                </span>
              ) : todayRecord?.status === 'LATE' && !todayRecord?.punchOut ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  LATE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  NOT PUNCHED IN
                </span>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. PUNCH IN / PUNCH OUT BUTTON (Touch-Friendly, >= 44px)     */}
          {/* ============================================================ */}
          <div>
            {isTodayWeeklyOff ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <span className="text-base">🛋️</span>
                <p className="text-xs font-semibold text-slate-800">Scheduled Weekly Off</p>
                <p className="text-[11px] text-slate-500">
                  Today is marked as your weekly off day. Enjoy your rest!
                </p>
              </div>
            ) : !todayRecord || todayRecord.status === 'NOT PUNCHED IN' ? (
              <div>
                {!punchSettings.enablePunchIn ? (
                  <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs text-center font-medium border border-amber-200">
                    Punch In is currently locked by administrator policy.
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingPunch}
                    onClick={handleMobilePunchIn}
                    className="w-full min-h-[48px] py-3.5 px-4 bg-[#087A4B] hover:bg-[#075C3A] active:bg-[#044D2F] text-white rounded-xl font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingPunch ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5 stroke-[2.2]" />
                    )}
                    <span>PUNCH IN</span>
                  </button>
                )}
              </div>
            ) : todayRecord?.punchIn && !todayRecord?.punchOut ? (
              <div>
                {!punchSettings.enablePunchOut ? (
                  <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs text-center font-medium border border-amber-200">
                    Punch Out is disabled by policy.
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingPunch}
                    onClick={() => setShowMobilePunchOutConfirm(true)}
                    className="w-full min-h-[48px] py-3.5 px-4 bg-[#151515] hover:bg-slate-800 active:bg-black text-white rounded-xl font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingPunch ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
                    )}
                    <span>PUNCH OUT (CONCLUDE SHIFT)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-[#EAF6F0] rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#087A4B]" />
                    <span className="font-semibold text-xs">Shift Completed: {todayRecord.status}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#087A4B] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {todayRecord.punchOutStatus || 'NORMAL_OUT'}
                  </span>
                </div>
                {todayRecord.overtimeMinutes > 0 && (
                  <div className="text-[11px] text-emerald-800 flex justify-between pt-1 border-t border-emerald-200/60 font-medium">
                    <span>Overtime Earned:</span>
                    <span className="font-bold font-mono">+{formatHours(todayRecord.overtimeMinutes)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 6. WORKING HOURS (Timer & Metrics)                          */}
          {/* ============================================================ */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#E6E8E7]">
              <span className="text-[10px] text-[#6B7280] block font-medium">Punch In</span>
              <span className="text-xs font-semibold text-[#151515] font-mono mt-0.5 block">
                {todayRecord?.punchIn || '--:--'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#E6E8E7]">
              <span className="text-[10px] text-[#6B7280] block font-medium">Working Hours</span>
              <span className="text-xs font-semibold text-[#087A4B] font-mono mt-0.5 block">
                {todayRecord?.status === 'WORKING'
                  ? formatHours(elapsedMinutes)
                  : todayRecord?.workingHoursMinutes
                  ? formatHours(todayRecord.workingHoursMinutes)
                  : '00h 00m'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#E6E8E7]">
              <span className="text-[10px] text-[#6B7280] block font-medium">Punch Out</span>
              <span className="text-xs font-semibold text-[#151515] font-mono mt-0.5 block">
                {todayRecord?.punchOut || '--:--'}
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 7. WORK MODE (Clean Selector, Read-only if locked)          */}
          {/* ============================================================ */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#151515]">Work Mode</span>
              {currentEmp?.allowFlexibleWorkMode ? (
                <span className="text-[10px] font-semibold text-[#087A4B] bg-[#EAF6F0] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Flexible Selection
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#6B7280] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Locked: {currentEmp?.defaultWorkMode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['OFFICE', 'WORK FROM HOME', 'HYBRID'] as WorkMode[]).map((mode) => {
                const isFlexible = Boolean(currentEmp?.allowFlexibleWorkMode);
                const isSelected = isFlexible
                  ? selectedWorkMode === mode
                  : currentEmp?.defaultWorkMode === mode;
                const isPunched = Boolean(todayRecord && todayRecord.status !== 'NOT PUNCHED IN');
                const isDisabled = !isFlexible || isPunched;

                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isFlexible && !isPunched) {
                        setSelectedWorkMode(mode);
                      }
                    }}
                    className={`min-h-[44px] py-2 px-1.5 rounded-xl border text-[11px] font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[#087A4B] text-white border-[#087A4B] shadow-xs'
                        : 'bg-white text-slate-600 border-[#E6E8E7]'
                    } ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}`}
                  >
                    {mode === 'OFFICE' && <Building2 className="w-3.5 h-3.5" />}
                    {mode === 'WORK FROM HOME' && <Laptop className="w-3.5 h-3.5" />}
                    {mode === 'HYBRID' && <MapPin className="w-3.5 h-3.5" />}
                    <span className="truncate max-w-full text-[10px]">
                      {mode === 'WORK FROM HOME' ? 'WFH' : mode}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. SHIFT INFORMATION (Compact Card)                         */}
        {/* ============================================================ */}
        <section className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#151515]">Today's Shift</span>
            <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {assignedShift ? assignedShift.name : 'General Shift'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-[#F7F8F7]">
              <span className="text-[10px] text-[#6B7280] block">Timing</span>
              <span className="font-mono font-medium text-[#151515] block mt-0.5">
                {assignedShift ? `${assignedShift.startTime} - ${assignedShift.endTime}` : '09:00 - 18:00'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#F7F8F7]">
              <span className="text-[10px] text-[#6B7280] block">Grace Period</span>
              <span className="font-mono font-medium text-emerald-700 block mt-0.5">
                {assignedShift ? `${assignedShift.gracePeriodMinutes} mins` : '10 mins'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#F7F8F7]">
              <span className="text-[10px] text-[#6B7280] block">Minimum Hours</span>
              <span className="font-mono font-medium text-[#151515] block mt-0.5">
                {assignedShift ? `${assignedShift.minWorkingHours} hours` : '8 hours'}
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 9. MOBILE CALENDAR (Responsive, No Horizontal Scroll)        */}
        {/* ============================================================ */}
        <section className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#087A4B]" />
              <span className="text-xs font-semibold text-[#151515]">October 2026</span>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-[11px] font-semibold text-[#087A4B] flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 7-column responsive days grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} className="text-[10px] font-semibold text-slate-400 py-1">
                {day}
              </span>
            ))}

            {/* Empty offset for Oct 1 (Thu = 4) */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`offset-${i}`} className="h-8 rounded-lg bg-transparent" />
            ))}

            {/* October days */}
            {Array.from({ length: currentMonthDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
              const record = attendance.find(
                (r) => r.employeeId === currentEmp?.id && r.date === dateStr
              );
              const holiday = holidays.find((h) => h.date === dateStr);
              const isToday = dateStr === todayStr;

              let dotBg = 'bg-transparent';
              if (holiday) dotBg = 'bg-purple-500';
              else if (record?.status === 'PRESENT' || record?.status === 'WORKING')
                dotBg = 'bg-emerald-500';
              else if (record?.status === 'LATE') dotBg = 'bg-amber-500';
              else if (record?.status === 'ON LEAVE') dotBg = 'bg-blue-500';
              else if (record?.status === 'WEEK OFF') dotBg = 'bg-slate-300';
              else if (record?.status === 'ABSENT') dotBg = 'bg-rose-500';

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    if (record) setSelectedCalendarRecord(record);
                  }}
                  className={`h-8 rounded-lg flex flex-col items-center justify-center transition-colors min-w-[36px] ${
                    isToday
                      ? 'bg-[#087A4B] text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-[11px] leading-none">{dayNum}</span>
                  {!isToday && dotBg !== 'bg-transparent' && (
                    <span className={`w-1 h-1 rounded-full ${dotBg} mt-0.5`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Leave
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Holiday
            </span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 10. RECENT ATTENDANCE (Cards/List Items Instead of Table)     */}
        {/* ============================================================ */}
        <section className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#151515]">Recent Attendance</span>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-[11px] font-semibold text-[#087A4B] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {personalRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedCalendarRecord(rec)}
                className="p-3 rounded-xl bg-[#F7F8F7] border border-[#E6E8E7] active:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono text-[#151515]">
                      {rec.date}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : rec.status === 'WORKING'
                          ? 'bg-emerald-100 text-[#087A4B]'
                          : rec.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[#087A4B]">
                    {rec.workingHoursMinutes > 0 ? formatHours(rec.workingHoursMinutes) : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-[#6B7280]">
                  <span>
                    {rec.punchIn || '--:--'} → {rec.punchOut || '--:--'}
                  </span>
                  <span className="capitalize text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rec.workMode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 11. LEAVE / WEEK OFF (Apply Leave & Balances)                */}
        {/* ============================================================ */}
        <section className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-[#087A4B]" />
              <span className="text-xs font-semibold text-[#151515]">Leave & Scheduled Off</span>
            </div>
            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="text-[11px] font-semibold text-white bg-[#087A4B] hover:bg-[#075C3A] px-3 py-1.5 rounded-lg min-h-[36px] flex items-center gap-1 shadow-xs"
            >
              <span>Apply Leave</span>
            </button>
          </div>

          {/* Scheduled Weekly Off banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#6B7280] block font-medium">Scheduled Weekly Off</span>
              <span className="font-semibold text-slate-800">
                {currentEmp?.weeklyOffDays?.join(' & ') || 'Saturday & Sunday'}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
              Weekly Off
            </span>
          </div>

          {/* Recent Leave Requests */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-[#6B7280] block">My Leave Requests</span>
            {myLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent leave applications.</p>
            ) : (
              myLeaves.map((l) => (
                <div
                  key={l.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-[#F7F8F7] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-[#151515] block">{l.leaveType}</span>
                    <span className="text-[10px] text-[#6B7280]">
                      {l.startDate} ({l.totalDays}d)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      l.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Immutability & Compliance notice */}
        <div className="text-center text-[11px] text-slate-400 py-2 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Attendance logs are tamper-proof and verified.</span>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 12. NOTIFICATIONS DRAWER / MODAL                            */}
      {/* ============================================================ */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#087A4B]" />
                <span className="text-sm font-semibold text-[#151515]">Notifications</span>
              </div>
              <button
                onClick={() => setShowNotificationsDrawer(false)}
                className="p-2 text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                      n.read
                        ? 'bg-[#F7F8F7] border-slate-200 text-slate-600'
                        : 'bg-[#EAF6F0] border-emerald-200 text-emerald-950 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* APPLY LEAVE MOBILE MODAL (Touch-friendly inputs)             */}
      {/* ============================================================ */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#151515]">Apply for Leave</h3>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-medium outline-none"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Reason</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Provide details regarding your absence..."
                  className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={leaveSubmitting}
                className="w-full min-h-[44px] py-3 bg-[#087A4B] hover:bg-[#075C3A] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{leaveSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Detail Modal for Calendar / Recent tap */}
      {selectedCalendarRecord && (
        <AttendanceDetailModal
          record={selectedCalendarRecord}
          onClose={() => setSelectedCalendarRecord(null)}
        />
      )}

      {/* Mobile Punch Out Confirmation Modal (Requirement 12) */}
      {showMobilePunchOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Punch Out
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conclude your working shift and submit attendance to the server.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Punch In Time:</span>
                <span className="font-mono font-bold text-slate-900">{todayRecord?.punchIn || '--:--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Working Time:</span>
                <span className="font-mono font-bold text-[#087A4B]">{formatHours(elapsedMinutes)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Expected Result:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {elapsedMinutes < 240 ? 'Early Out (0 Day)' : elapsedMinutes < 480 ? 'Half Day (0.5 Day)' : 'Present (1.0 Day)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowMobilePunchOutConfirm(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobilePunchOutConfirm(false);
                  handleMobilePunchOut();
                }}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
              >
                Confirm Punch Out
              </button>
            </div>
          </div>
        </div>
      )}

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
                Are you sure you want to sign out of <strong>{currentEmp?.name || currentUser?.name || 'Staff'}</strong>?
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

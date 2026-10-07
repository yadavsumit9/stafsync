import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  ShieldAlert,
  Search,
  X,
  UserCheck,
  User,
  Coffee,
  Building2,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  searchTerm = '',
  onSearchChange,
}) => {
  const { currentUser, logout, leaves } = useAttendance();
  const isAdmin = currentUser?.role === 'admin';

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const NavItem = ({
    tab,
    icon: Icon,
    label,
    badge,
  }: {
    tab: string;
    icon: React.ElementType;
    label: string;
    badge?: string | number;
  }) => {
    const isActive = currentTab === tab;
    return (
      <button
        onClick={() => handleNav(tab)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
          isActive
            ? 'bg-[#18181B] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-4 h-4 transition-colors ${
              isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-[#087A4B]'
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Top Brand Logo matching OripioFin in reference */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#087A4B] to-[#044D2F] flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4"
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
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
              StaffSync
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">
              Workforce OS
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input matching reference with ⌘ K */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-[#087A4B] focus:ring-1 focus:ring-[#087A4B] outline-none transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1 py-0.5 pointer-events-none">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* MAIN MENU */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          <div className="space-y-1">
            <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
            {isAdmin ? (
              <>
                <NavItem tab="employees" icon={Users} label="Employees" />
                <NavItem tab="attendance" icon={Clock} label="Attendance" />
                <NavItem tab="calendar" icon={Calendar} label="Calendar" />
                <NavItem
                  tab="leaves"
                  icon={Coffee}
                  label="Leave Requests"
                  badge={pendingLeavesCount > 0 ? pendingLeavesCount : undefined}
                />
                <NavItem tab="shifts" icon={Clock} label="Shifts" />
                <NavItem tab="holidays" icon={CalendarDays} label="Holidays" />
              </>
            ) : (
              <>
                <NavItem tab="attendance" icon={Clock} label="My Attendance" />
                <NavItem tab="calendar" icon={Calendar} label="Calendar" />
                <NavItem tab="leaves" icon={Coffee} label="My Leaves" />
                <NavItem tab="profile" icon={User} label="My Profile & ID" />
              </>
            )}
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        {isAdmin ? (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Analytics
            </div>
            <div className="space-y-1">
              <NavItem tab="reports" icon={FileSpreadsheet} label="Reports" />
              <NavItem tab="productivity" icon={TrendingUp} label="Productivity" />
              <NavItem tab="analytics" icon={BarChart3} label="Attendance Analytics" />
            </div>
          </div>
        ) : (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Work Schedule
            </div>
            <div className="space-y-1">
              <NavItem tab="holidays" icon={CalendarDays} label="Holidays" />
              <NavItem tab="shifts" icon={Clock} label="Shift Information" />
            </div>
          </div>
        )}

        {/* GENERAL SECTION */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            General
          </div>
          <div className="space-y-1">
            {isAdmin && <NavItem tab="settings" icon={Settings} label="Settings" />}
            {isAdmin && <NavItem tab="audit" icon={ShieldAlert} label="Audit Logs" />}
            <button
              onClick={() => handleNav('help')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help Desk</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Promo/Status Card matching "Upgrade Pro! 💡" in reference */}
      <div className="p-3 m-3 rounded-2xl bg-[#F6F7F9] border border-slate-200/90">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <span className="text-xs font-bold text-slate-900">
            {isAdmin ? 'Attendance Policy' : 'Shift Active'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-normal">
          {isAdmin
            ? 'Grace threshold: 15 mins. Punch cutoff: 11:00 AM.'
            : 'General Shift: 09:30 AM to 06:30 PM (Asia/Kolkata)'}
        </p>
        <button
          onClick={() => handleNav(isAdmin ? 'settings' : 'shifts')}
          className="mt-2.5 w-full py-1.5 px-3 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3 h-3" />
          <span>{isAdmin ? 'Configure Rules' : 'View Shift Details'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

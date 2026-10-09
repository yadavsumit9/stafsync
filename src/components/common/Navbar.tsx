import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Menu,
  Clock,
  UserPlus,
  RefreshCw,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onOpenQuickAction?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenMobileMenu,
  onOpenQuickAction,
}) => {
  const {
    currentUser,
    logout,
    notifications,
    markNotificationRead,
    refreshData,
    branding,
    punchSettings,
    shifts,
  } = useAttendance();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpPopover, setShowHelpPopover] = useState(false);

  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const helpPopoverRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        helpPopoverRef.current &&
        !helpPopoverRef.current.contains(target) &&
        helpButtonRef.current &&
        !helpButtonRef.current.contains(target)
      ) {
        setShowHelpPopover(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHelpPopover(false);
        setShowNotifications(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Tab label display
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'employees':
        return 'Employees Directory';
      case 'attendance':
        return 'Attendance Management';
      case 'calendar':
        return 'Attendance Calendar';
      case 'leaves':
        return 'Leave Management';
      case 'shifts':
        return 'Shift Configuration';
      case 'holidays':
        return 'Holiday Schedule';
      case 'reports':
        return 'Reports & Logs';
      case 'productivity':
        return 'Productivity Scores';
      case 'analytics':
        return 'Workforce Analytics';
      case 'settings':
        return 'System & Punch Settings';
      case 'branding':
        return 'Company Branding';
      case 'audit':
        return 'Audit Logs';
      case 'profile':
        return 'My Profile';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb: "ProjectName › Tab" */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="font-semibold text-slate-900">{branding.projectName}</span>
          <span className="text-slate-400">›</span>
          <span className="text-slate-500 font-medium truncate max-w-[140px] sm:max-w-[220px]">
            {getTabTitle(currentTab)}
          </span>
        </div>
      </div>

      {/* Right utilities: Help, Notifications, User Profile, Green Action CTA */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Help Icon */}
        <button
          type="button"
          ref={helpButtonRef}
          onClick={() => {
            setShowHelpPopover((prev) => !prev);
            setShowNotifications(false);
            setShowUserDropdown(false);
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
            showHelpPopover
              ? 'bg-[#EAF6F0] text-[#087A4B] ring-2 ring-[#087A4B]/20'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="System Help & Guidelines"
          aria-label="System Help & Guidelines"
          aria-expanded={showHelpPopover}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Help Popover Dropdown */}
        {showHelpPopover && (
          <div
            ref={helpPopoverRef}
            className="absolute right-0 sm:right-28 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF6F0] text-[#087A4B] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">
                    Attendance Help & Rules
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Workforce Guidelines & Shift Policy
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpPopover(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close help popover"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Policy Cards from Context */}
            <div className="p-3 space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/90">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-800">
                    Standard Shift Hours
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#087A4B] border border-emerald-200/70">
                    {shifts?.[0]?.startTime || '09:30 AM'} - {shifts?.[0]?.endTime || '06:30 PM'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Scheduled daily hours with {shifts?.[0]?.breakDurationMinutes || 60}m lunch break allocation.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/90">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-800">
                    Punctuality & Grace Window
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                    +{punchSettings?.gracePeriodMinutes || 15} Mins Grace
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Clock-in until grace cutoff is marked on-time. Later arrivals are flagged as Late.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/90">
                <span className="text-[11px] font-semibold text-slate-800 block">
                  Punch Security & Rules
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Punch logs are tamper-proof. Modifications require HR Admin approval and audit reasons.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-3 pt-2 pb-0.5 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHelpPopover(false);
                  onNavigate(currentUser?.role === 'admin' ? 'settings' : 'shifts');
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] active:bg-[#05492d] rounded-xl transition-all text-center cursor-pointer shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#087A4B]/40"
                aria-label={currentUser?.role === 'admin' ? 'Configure shift rules & settings' : 'View shift details'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-white/90 shrink-0" />
                <span>{currentUser?.role === 'admin' ? 'Configure Rules' : 'Shift Details'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Refresh Data quick button */}
        <button
          onClick={() => {
            refreshData();
          }}
          className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Refresh database records"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>

        {/* Notifications Icon with popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelpPopover(false);
              setShowUserDropdown(false);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <span className="text-xs text-slate-500 font-mono">
                  {unreadNotifications.length} unread
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.createdAt.split(' ')[1]}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowHelpPopover(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#087A4B] to-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium capitalize">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Staff'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || ''}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded-md">
                  {currentUser?.role ? currentUser.role.toUpperCase() : 'USER'}
                </span>
              </div>
              {currentUser?.role === 'staff' && (
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Digital ID & Profile</span>
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Punch Rules & Settings</span>
                </button>
              )}
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => {
                  logout();
                  setShowUserDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Green CTA Button (Matches Reference "Share / Action" button) */}
        {onOpenQuickAction && (
          <button
            onClick={onOpenQuickAction}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
          >
            {currentUser?.role === 'admin' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>+ Add Employee</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Mark Attendance</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  HelpCircle,
  Mail,
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
  CheckCircle2,
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
  const { currentUser, logout, notifications, markNotificationRead, refreshData, branding } = useAttendance();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Help Icon */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="System Help & Guidelines"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

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
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute 1 top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
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
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#087A4B] to-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name.split(' ')[0]}
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
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded-md">
                  {currentUser?.role.toUpperCase()}
                </span>
              </div>
              {currentUser?.role === 'staff' && (
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
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
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
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
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
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
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-all shadow-xs hover:shadow-sm"
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#087A4B]" />
                <h3 className="text-base font-bold text-slate-900">Attendance Help Desk</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-semibold text-slate-900">Punctuality & Grace Policy</p>
                <p className="mt-1">
                  General shift starts at 09:30 AM with a 15-minute grace window until 09:45 AM.
                  Arrivals after 09:45 AM are automatically marked as Late.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-semibold text-slate-900">Punch Restrictions</p>
                <p className="mt-1">
                  Once punched in and punched out, records are immutable for staff members. Only HR
                  Administrators can approve manual punch adjustments with audit justification.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
                <p className="font-semibold text-slate-900">Account Access</p>
                <p className="mt-1">
                  Staff accounts are issued directly by HR Administration upon employee onboarding. Contact your system administrator if you require credential assistance.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

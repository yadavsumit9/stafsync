import React, { useState, useEffect } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AdminDesktopRequiredScreen } from './components/common/AdminDesktopRequiredScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { CalendarView } from './components/admin/CalendarView';
import { LeaveManagement } from './components/admin/LeaveManagement';
import { ShiftManagement } from './components/admin/ShiftManagement';
import { HolidayManagement } from './components/admin/HolidayManagement';
import { ReportsView } from './components/admin/ReportsView';
import { ProductivityView } from './components/admin/ProductivityView';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { SettingsView } from './components/admin/SettingsView';
import { AuditLogView } from './components/admin/AuditLogView';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffProfile } from './components/staff/StaffProfile';
import { StaffLeavePortal } from './components/staff/StaffLeavePortal';
import { StaffAttendanceHistory } from './components/staff/StaffAttendanceHistory';
import { StaffMobileBottomNav } from './components/staff/StaffMobileBottomNav';
import { useViewport } from './hooks/useViewport';
import { ShieldAlert, ArrowLeft, Bell, User, LogOut } from 'lucide-react';

function getTabLabel(tab: string, defaultName = 'StaffSync'): string {
  switch (tab) {
    case 'dashboard':
      return 'Dashboard';
    case 'employees':
      return 'Employee Directory';
    case 'attendance':
      return 'Attendance Management';
    case 'calendar':
      return 'Attendance Calendar';
    case 'leaves':
      return 'Leave Management';
    case 'shifts':
      return 'Shift Schedules';
    case 'holidays':
      return 'Holiday Calendar';
    case 'reports':
      return 'Reports & Export';
    case 'productivity':
      return 'Productivity Insights';
    case 'analytics':
      return 'Workforce Analytics';
    case 'settings':
      return 'System Settings';
    case 'audit':
      return 'Audit Trail';
    case 'profile':
      return 'My Profile & Pass';
    case 'branding':
      return 'Company Branding';
    default:
      return defaultName;
  }
}

function MainApp() {
  const { currentUser, logout, leaves, notifications, branding } = useAttendance();
  const { width, isMobile, isAdminSupported } = useViewport();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [showMobileLogoutModal, setShowMobileLogoutModal] = useState(false);
  const [bypassDesktopCheck, setBypassDesktopCheck] = useState(false);

  // Dynamic Browser Tab Title updating with Project Name & Tab
  useEffect(() => {
    const name = branding?.projectName || 'StaffSync';
    const tabName = getTabLabel(currentTab);
    document.title = currentTab === 'dashboard' ? `${name} — Dashboard` : `${name} — ${tabName}`;
  }, [currentTab, branding?.projectName]);

  // If user is not logged in, show unified Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={() => {
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // ============================================================
  // ADMIN MOBILE / TABLET RESTRICTION (Requirement 20 - 27)
  // Admin Panel is Desktop-Only. If viewport width < 1024px,
  // show dedicated full-screen "Desktop Required" restriction screen.
  // This occurs BEFORE rendering the Admin Dashboard or sidebar.
  // ============================================================
  if (isAdmin && !isAdminSupported && !bypassDesktopCheck) {
    return (
      <AdminDesktopRequiredScreen
        onBackToLogin={logout}
        onProceedAnyway={() => setBypassDesktopCheck(true)}
      />
    );
  }

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Render current tab component with role-based protection
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddEmployee={() => setCurrentTab('employees')}
            onOpenAddLeave={() => setCurrentTab('leaves')}
          />
        ) : (
          <StaffDashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenLeaveModal={() => setCurrentTab('leaves')}
          />
        );

      case 'employees':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Administrative privileges are required to access employee management records.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <EmployeeManagement />;

      case 'attendance':
        return isAdmin ? <AttendanceManagement /> : <StaffAttendanceHistory />;

      case 'calendar':
        return <CalendarView />;

      case 'leaves':
        return isAdmin ? <LeaveManagement /> : <StaffLeavePortal />;

      case 'shifts':
        return <ShiftManagement />;

      case 'holidays':
        return <HolidayManagement />;

      case 'reports':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                Administrative privileges are required to access organizational attendance reports.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <ReportsView />;

      case 'productivity':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                Productivity scores are managed by organization administrators.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <ProductivityView />;

      case 'analytics':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                Workforce analytics is restricted to admin accounts.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <AnalyticsView />;

      case 'settings':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                System settings can only be altered by authorized system administrators.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <SettingsView />;

      case 'branding':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                Organization branding and white-label settings are restricted to system administrators.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <SettingsView initialTab="branding" />;

      case 'audit':
        if (!isAdmin) {
          return (
            <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#E6E8E7] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#151515]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280]">
                Compliance audit trails are confidential and restricted to administrators.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 bg-[#087A4B] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <AuditLogView />;

      case 'profile':
        return <StaffProfile />;

      case 'help':
        return (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-[#151515]">Attendance Regulations & Guidelines</h2>
            <div className="p-4 bg-white rounded-2xl border border-[#E6E8E7] text-xs text-[#6B7280] space-y-2">
              <p className="font-semibold text-[#151515]">Official General Shift Regulations:</p>
              <p>• General Shift Schedule: 09:30 AM to 06:30 PM (9 hours with 1h lunch break)</p>
              <p>• Grace Buffer: 15 minutes (Clock-in until 09:45 AM considered on-time)</p>
              <p>• Clock-ins between 09:46 AM and 11:00 AM automatically recorded as Late</p>
              <p>• Maximum cutoff: 11:00 AM (Clock-in closes after 11:00 AM)</p>
              <p>• Immutability: Staff cannot edit punch logs once submitted</p>
            </div>
          </div>
        );

      default:
        return isAdmin ? (
          <AdminDashboard
            onNavigate={setCurrentTab}
            onOpenAddEmployee={() => setCurrentTab('employees')}
            onOpenAddLeave={() => setCurrentTab('leaves')}
          />
        ) : (
          <StaffDashboard
            onNavigate={setCurrentTab}
            onOpenLeaveModal={() => setCurrentTab('leaves')}
          />
        );
    }
  };

  // Mobile Staff Layout
  if (!isAdmin && isMobile) {
    return (
      <div className="min-h-screen bg-[#F7F8F7] flex flex-col">
        {/* Compact Header for non-dashboard sub-pages on mobile */}
        {currentTab !== 'dashboard' && (
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E8E7] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#087A4B] min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xs font-semibold text-[#151515] truncate max-w-[150px]">
              {getTabLabel(currentTab)}
            </h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentTab('profile')}
                className="w-8 h-8 rounded-xl bg-[#EAF6F0] text-[#087A4B] font-semibold text-xs flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="View Profile"
                aria-label="View profile"
              >
                {(currentUser?.name || 'US').slice(0, 2).toUpperCase()}
              </button>
              <button
                onClick={() => setShowMobileLogoutModal(true)}
                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center hover:bg-rose-100 transition-colors"
                title="Log Out of Account"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1">{renderContent()}</main>

        {/* Bottom Navigation for Staff */}
        <StaffMobileBottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          pendingLeavesCount={pendingLeavesCount}
        />

        {/* Mobile Logout Confirmation Modal */}
        {showMobileLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign Out</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to sign out of <strong>{currentUser?.name || 'your account'}</strong>?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMobileLogoutModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileLogoutModal(false);
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
  }

  // Tablet & Desktop Layout for Staff & Desktop Layout for Admin
  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-row">
      {/* Sidebar (Desktop and Tablet) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        searchTerm={menuSearch}
        onSearchChange={setMenuSearch}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Navbar */}
        <Navbar
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickAction={() => {
            if (isAdmin) {
              setCurrentTab('employees');
            } else {
              setCurrentTab('dashboard');
            }
          }}
        />

        {/* Tab View Content */}
        <main className="flex-1 pb-12">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <MainApp />
    </AttendanceProvider>
  );
}

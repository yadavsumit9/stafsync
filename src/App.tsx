import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
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

function MainApp() {
  const { currentUser } = useAttendance();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');

  // If user is not logged in, show unified Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={(role) => {
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // Render current tab component
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
        return isAdmin ? <EmployeeManagement /> : <StaffProfile />;

      case 'attendance':
        return <AttendanceManagement />;

      case 'calendar':
        return <CalendarView />;

      case 'leaves':
        return isAdmin ? <LeaveManagement /> : <StaffLeavePortal />;

      case 'shifts':
        return <ShiftManagement />;

      case 'holidays':
        return <HolidayManagement />;

      case 'reports':
        return isAdmin ? <ReportsView /> : <AttendanceManagement />;

      case 'productivity':
        return isAdmin ? <ProductivityView /> : <StaffDashboard onNavigate={setCurrentTab} onOpenLeaveModal={() => setCurrentTab('leaves')} />;

      case 'analytics':
        return isAdmin ? <AnalyticsView /> : <StaffDashboard onNavigate={setCurrentTab} onOpenLeaveModal={() => setCurrentTab('leaves')} />;

      case 'settings':
        return isAdmin ? <SettingsView /> : <StaffProfile />;

      case 'audit':
        return isAdmin ? <AuditLogView /> : <StaffDashboard onNavigate={setCurrentTab} onOpenLeaveModal={() => setCurrentTab('leaves')} />;

      case 'profile':
        return <StaffProfile />;

      case 'help':
        return (
          <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Attendance Help Desk & Regulations</h2>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">Official General Shift Rules:</p>
              <p>• General Shift: 09:30 AM to 06:30 PM (9 hours with 1h lunch break)</p>
              <p>• Grace buffer: 15 minutes (Clock-in until 09:45 AM considered on-time)</p>
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

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-row">
      {/* Sidebar matching reference image */}
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

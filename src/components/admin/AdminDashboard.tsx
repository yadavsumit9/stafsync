import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Coffee,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
  UserPlus,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Calendar,
  Building2,
  Laptop,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord, WorkMode } from '../../types';
import { AttendanceDetailModal } from '../common/AttendanceDetailModal';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddEmployee: () => void;
  onOpenAddLeave: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenAddEmployee,
  onOpenAddLeave,
}) => {
  const { employees, attendance, leaves, shifts, refreshData } = useAttendance();

  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Month'>('Today');
  const [chartView, setChartView] = useState<'Weekly' | 'Monthly'>('Monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(2); // Default active bar like reference image!

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter((r) => r.date === todayStr);

  // Statistics calculation (Requirement 15: Clean 0 state)
  const totalEmployees = employees.length;
  const presentToday = todayRecords.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length;
  const lateToday = todayRecords.filter((r) => r.status === 'LATE').length;
  const onLeaveToday = todayRecords.filter((r) => r.status === 'ON LEAVE').length;
  const weekOffToday = todayRecords.filter((r) => r.status === 'WEEK OFF').length;
  const notPunchedIn = todayRecords.filter((r) => r.status === 'NOT PUNCHED IN').length;
  const absentToday = totalEmployees > 0 ? Math.max(0, totalEmployees - (presentToday + lateToday + onLeaveToday + weekOffToday)) : 0;
  const attendanceRate = totalEmployees > 0 ? Math.round(((presentToday + lateToday) / totalEmployees) * 100) : 0;

  // Department counts
  const availableDepts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  const departments = availableDepts.length > 0 ? availableDepts : ['Engineering', 'Design', 'Operations', 'Human Resources'];

  // Filtered today's attendance table
  const filteredRecords = todayRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || r.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Dynamic Chart data computed from real attendance
  const hasAttendanceData = attendance.length > 0;
  const currentChartData: { label: string; rate: number; hours: string; count: number }[] = [];

  if (hasAttendanceData) {
    if (chartView === 'Weekly') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().slice(0, 10);
        const dayRecs = attendance.filter((r) => r.date === dStr);
        const pres = dayRecs.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING' || r.status === 'LATE').length;
        const rate = totalEmployees > 0 ? Math.min(100, Math.round((pres / totalEmployees) * 100)) : 0;
        const avgHrs = dayRecs.length > 0 ? (dayRecs.reduce((a, b) => a + (b.workingHoursMinutes || 0), 0) / dayRecs.length / 60).toFixed(1) : '0.0';
        currentChartData.push({
          label: dayNames[d.getDay()],
          rate,
          hours: `${avgHrs}h`,
          count: pres,
        });
      }
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yMonth = d.toISOString().slice(0, 7);
        const mRecs = attendance.filter((r) => r.date.startsWith(yMonth));
        const pres = mRecs.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING' || r.status === 'LATE').length;
        const rate = mRecs.length > 0 ? Math.min(100, Math.round((pres / mRecs.length) * 100)) : 0;
        const avgHrs = mRecs.length > 0 ? (mRecs.reduce((a, b) => a + (b.workingHoursMinutes || 0), 0) / mRecs.length / 60).toFixed(1) : '0.0';
        currentChartData.push({
          label: monthNames[d.getMonth()],
          rate,
          hours: `${avgHrs}h`,
          count: pres,
        });
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Top Section Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Real-time workforce attendance, biometric punch logs, and departmental breakdown
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Filter Dropdown */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-xs font-medium text-slate-700 px-3.5 py-2 pr-8 rounded-xl shadow-xs outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={() => {
              refreshData();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh records from database"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Row (Exact visual hierarchy of reference image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Emerald Green Gradient Card (Matches "My balance" card in reference image) */}
        <div className="bg-gradient-to-br from-[#087A4B] via-[#076E43] to-[#044D2F] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/95">Total Employees</h3>
                <p className="text-[11px] font-normal text-emerald-100/75">Workforce Overview & Shifts</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-white/70 hover:text-white p-1"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight font-mono">
              {totalEmployees}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              {totalEmployees === 0 ? '0 registered' : `${totalEmployees} active`}
            </span>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('employees')}
              className="text-white/90 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>See employee list</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-normal text-emerald-200/80 font-mono">
              {presentToday + lateToday} on duty today
            </span>
          </div>
        </div>

        {/* Card 2: Crisp White Card (Matches "Savings account" in reference) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#087A4B] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Present Today</h3>
                <p className="text-[11px] font-normal text-slate-400">On-Time & Active Workforce</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-mono">
              {presentToday}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
              {attendanceRate}% present
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('attendance')}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>View live roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-normal text-slate-400">
              {lateToday} late arrival{lateToday !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Card 3: Crisp White Card (Matches "Investment portfolio" in reference) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">On Leave / Week Off</h3>
                <p className="text-[11px] font-normal text-slate-400">Approved Absences & Breaks</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('leaves')}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-mono">
              {onLeaveToday + weekOffToday + absentToday}
            </span>
            <span className="inline-flex items-center text-xs font-normal text-slate-500 font-mono">
              {onLeaveToday} Leaves · {weekOffToday} Off · {absentToday} Absent
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('leaves')}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Manage requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-normal text-slate-400">
              {leaves.filter((l) => l.status === 'Pending').length} pending approval
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Left: Department Distribution (Like "My Wallet"), Right: Attendance Trends Chart (Like "Cash Flow") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Department Distribution Card (4 compact currency-style sub-cards) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Workforce by Department</h3>
              <p className="text-xs font-normal text-slate-400">Live active staffing today</p>
            </div>
            <button
              onClick={onOpenAddEmployee}
              className="text-xs font-semibold text-[#087A4B] hover:text-[#065A37] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Grid of 4 Department Sub-cards matching USD/EUR/BDT/GBP cards */}
          <div className="grid grid-cols-2 gap-3.5 my-4">
            {departments.map((dept) => {
              const totalInDept = employees.filter((e) => e.department === dept).length;
              const presentInDept = todayRecords.filter(
                (r) => r.department === dept && (r.status === 'PRESENT' || r.status === 'WORKING')
              ).length;
              const rate = totalInDept > 0 ? Math.round((presentInDept / totalInDept) * 100) : 0;

              return (
                <div
                  key={dept}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate">{dept}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
                    {presentInDept} / {totalInDept}
                  </div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                    {rate}% present today
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Work Mode Split */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-normal">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Office: {todayRecords.filter((r) => r.workMode === 'OFFICE').length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>WFH: {todayRecords.filter((r) => r.workMode === 'WORK FROM HOME').length}</span>
            </span>
            <span>
              Hybrid: {todayRecords.filter((r) => r.workMode === 'HYBRID').length}
            </span>
          </div>
        </div>

        {/* Right: Attendance Trend Chart (Replicating "Cash Flow $342,323.44" with interactive hover tooltip) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 font-normal">Attendance & Punctuality Trend</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
                {attendanceRate}% Average Rate
              </div>
            </div>

            {/* Segmented Control Pill matching [Monthly | Yearly] */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setChartView('Weekly')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartView === 'Weekly'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartView('Monthly')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartView === 'Monthly'
                    ? 'bg-[#087A4B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* SVG Bar Chart or Empty State */}
          {currentChartData.length === 0 ? (
            <div className="relative mt-6 pt-4 h-52 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-xs font-semibold text-slate-700">No data available yet.</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Attendance charts will automatically populate once employees log shifts.</span>
            </div>
          ) : (
            <div className="relative mt-6 pt-4 h-52 flex items-end justify-between px-2 sm:px-6">
              {/* Interactive Tooltip Card pinned over selected bar */}
              {activeTooltipIndex !== null && currentChartData[activeTooltipIndex] && (
                <div
                  className="absolute z-20 top-0 bg-[#18181B] text-white rounded-xl p-2.5 shadow-xl text-xs space-y-1 animate-in fade-in zoom-in-95 pointer-events-none"
                  style={{
                    left: `${(activeTooltipIndex / (currentChartData.length - 1)) * 80 + 10}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-slate-200 border-b border-white/10 pb-1">
                    {currentChartData[activeTooltipIndex].label} Record
                  </div>
                  <div className="flex items-center justify-between gap-4 text-emerald-400 font-mono">
                    <span>Attendance:</span>
                    <span>{currentChartData[activeTooltipIndex].rate}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300 font-mono text-[11px]">
                    <span>Avg Hours:</span>
                    <span>{currentChartData[activeTooltipIndex].hours}</span>
                  </div>
                </div>
              )}

              {/* Left Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Bars */}
              <div className="w-full pl-8 h-full flex items-end justify-between gap-3 sm:gap-6">
                {currentChartData.map((item, idx) => {
                  const isSelected = activeTooltipIndex === idx;
                  const heightPercent = item.rate;

                  return (
                    <div
                      key={item.label}
                      onClick={() => setActiveTooltipIndex(idx)}
                      className="flex-1 flex flex-col items-center gap-2 cursor-pointer group h-full justify-end"
                    >
                      <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-t from-[#087A4B] to-emerald-400 shadow-md ring-2 ring-[#087A4B]/20'
                              : 'bg-emerald-100 group-hover:bg-emerald-200'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? 'text-[#087A4B] font-bold' : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Today's Live Attendance Table (Replicating "Recent Activities" in reference) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Bar with Search & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Attendance</h3>
            <p className="text-xs text-slate-400">
              Live biometric records for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (Asia/Kolkata)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-[#087A4B] outline-none transition-all w-36 sm:w-48"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
            >
              <option value="ALL">All Depts</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="WORKING">Working</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ON LEAVE">On Leave</option>
              <option value="NOT PUNCHED IN">Not Punched</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded text-[#087A4B] focus:ring-[#087A4B]" />
                </th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Punch In</th>
                <th className="py-3.5 px-4">Punch Out</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-xs">No attendance records yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Add your first employee to start managing attendance.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded text-[#087A4B] focus:ring-[#087A4B]" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#087A4B] font-bold flex items-center justify-center text-[11px]">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 group-hover:text-[#087A4B] transition-colors">
                            {rec.employeeName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{rec.employeeId}</td>
                      <td className="py-3.5 px-4">{rec.department}</td>
                      <td className="py-3.5 px-4 text-slate-500">{rec.shiftName}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {rec.punchIn || '--:--'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {rec.punchOut || '--:--'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-medium text-slate-600">
                          {rec.workMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rec.status === 'PRESENT'
                                ? 'bg-emerald-500'
                                : rec.status === 'WORKING'
                                ? 'bg-emerald-400 animate-ping'
                                : rec.status === 'LATE'
                                ? 'bg-amber-500'
                                : rec.status === 'ON LEAVE'
                                ? 'bg-blue-500'
                                : rec.status === 'WEEK OFF'
                                ? 'bg-slate-400'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`font-semibold ${
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
                            {rec.status === 'WORKING'
                              ? 'Working'
                              : rec.status === 'PRESENT'
                              ? 'Completed'
                              : rec.status}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          title="View / Edit record"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Detail / Edit Modal */}
      {selectedRecord && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdated={() => {
            const updated = attendance.find((r) => r.id === selectedRecord.id);
            if (updated) setSelectedRecord(updated);
          }}
        />
      )}
    </div>
  );
};

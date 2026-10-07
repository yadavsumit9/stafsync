import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Coffee,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const ReportsView: React.FC = () => {
  const { employees, attendance } = useAttendance();

  const [reportType, setReportType] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const departments = ['Engineering', 'Design', 'Operations', 'Human Resources', 'Marketing', 'Finance'];

  // Filter employees
  const targetEmployees = employees.filter(
    (e) => departmentFilter === 'ALL' || e.department === departmentFilter
  );

  // Compute monthly report for each employee
  const monthlySummaries = targetEmployees.map((emp) => {
    const empRecords = attendance.filter(
      (r) => r.employeeId === emp.id && r.date.startsWith(selectedMonth)
    );

    const totalWorkingDays = empRecords.filter((r) => r.status !== 'WEEK OFF' && r.status !== 'HOLIDAY').length || 1;
    const presentDays = empRecords.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length;
    const lateDays = empRecords.filter((r) => r.status === 'LATE').length;
    const leaveDays = empRecords.filter((r) => r.status === 'ON LEAVE').length;
    const absentDays = empRecords.filter((r) => r.status === 'ABSENT').length;
    const weekOffDays = empRecords.filter((r) => r.status === 'WEEK OFF').length;
    const holidayDays = empRecords.filter((r) => r.status === 'HOLIDAY').length;

    const totalMinutes = empRecords.reduce((acc, r) => acc + (r.workingHoursMinutes || 0), 0);
    const totalOvertime = empRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
    const avgMinutes = presentDays + lateDays > 0 ? Math.round(totalMinutes / (presentDays + lateDays)) : 0;

    const attendanceRate = totalWorkingDays > 0 ? Math.round(((presentDays + lateDays) / totalWorkingDays) * 100) : 0;

    return {
      employee: emp,
      totalWorkingDays,
      presentDays,
      lateDays,
      leaveDays,
      absentDays,
      weekOffDays,
      holidayDays,
      totalMinutes,
      totalOvertime,
      avgMinutes,
      attendanceRate,
    };
  });

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const exportMonthlyCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Position',
      'Working Days',
      'Present',
      'Late',
      'Leaves',
      'Absent',
      'Week Off',
      'Holiday',
      'Total Hours',
      'Avg Daily Hours',
      'Overtime Mins',
      'Attendance %',
    ];

    const rows = monthlySummaries.map((s) => [
      s.employee.id,
      `"${s.employee.name}"`,
      s.employee.department,
      `"${s.employee.position}"`,
      s.totalWorkingDays,
      s.presentDays,
      s.lateDays,
      s.leaveDays,
      s.absentDays,
      s.weekOffDays,
      s.holidayDays,
      formatHours(s.totalMinutes),
      formatHours(s.avgMinutes),
      s.totalOvertime,
      `${s.attendanceRate}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `StaffSync_Monthly_Attendance_Report_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Workforce Attendance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detailed monthly aggregations, weekly timelines, and CSV exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportMonthlyCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Toggle Type */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'monthly' ? 'bg-[#18181B] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly Summary
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'weekly' ? 'bg-[#18181B] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Weekly Timesheet
            </button>
          </div>

          {/* Month Selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl outline-none"
          />
        </div>

        {/* Department filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-50 text-xs text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {reportType === 'monthly' ? (
        /* Monthly Aggregations Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Work Days</th>
                  <th className="py-3.5 px-4 text-center">Present</th>
                  <th className="py-3.5 px-4 text-center">Late</th>
                  <th className="py-3.5 px-4 text-center">Leaves</th>
                  <th className="py-3.5 px-4 text-center">Absent</th>
                  <th className="py-3.5 px-4">Total Hours</th>
                  <th className="py-3.5 px-4">Avg Daily</th>
                  <th className="py-3.5 px-4">Overtime</th>
                  <th className="py-3.5 px-4 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlySummaries.map((s) => {
                  return (
                    <tr key={s.employee.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{s.employee.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.employee.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{s.employee.department}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">{s.totalWorkingDays}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                        {s.presentDays}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-amber-700">{s.lateDays}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-blue-700">{s.leaveDays}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-rose-700">{s.absentDays}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatHours(s.totalMinutes)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatHours(s.avgMinutes)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700">
                        {s.totalOvertime > 0 ? `${s.totalOvertime}m` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            s.attendanceRate >= 90
                              ? 'bg-emerald-50 text-emerald-700'
                              : s.attendanceRate >= 80
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {s.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Weekly View Table (Requirement 26) */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Attendance Matrix (October 1 to October 7, 2026)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3 text-center">Thu (Oct 1)</th>
                  <th className="py-3 px-3 text-center">Fri (Oct 2 - Hol)</th>
                  <th className="py-3 px-3 text-center">Sat (Oct 3)</th>
                  <th className="py-3 px-3 text-center">Sun (Oct 4)</th>
                  <th className="py-3 px-3 text-center">Mon (Oct 5)</th>
                  <th className="py-3 px-3 text-center">Tue (Oct 6)</th>
                  <th className="py-3 px-3 text-center">Wed (Oct 7 - Today)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {targetEmployees.map((emp) => {
                  const dates = [
                    '2026-10-01',
                    '2026-10-02',
                    '2026-10-03',
                    '2026-10-04',
                    '2026-10-05',
                    '2026-10-06',
                    '2026-10-07',
                  ];

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                      </td>
                      {dates.map((d) => {
                        const rec = attendance.find((r) => r.employeeId === emp.id && r.date === d);
                        const status = rec?.status || 'WEEK OFF';

                        return (
                          <td key={d} className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                status === 'PRESENT' || status === 'WORKING'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : status === 'LATE'
                                  ? 'bg-amber-50 text-amber-700'
                                  : status === 'ON LEAVE'
                                  ? 'bg-blue-50 text-blue-700'
                                  : status === 'HOLIDAY'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {status === 'PRESENT' || status === 'WORKING' ? 'Present' : status}
                            </span>
                            {rec?.workingHoursMinutes ? (
                              <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                                {formatHours(rec.workingHoursMinutes)}
                              </span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

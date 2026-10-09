import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Coffee,
  CheckCircle2,
  Search,
  Filter,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const ProductivityView: React.FC = () => {
  const { employees, attendance } = useAttendance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  const departments = ['Engineering', 'Design', 'Operations', 'Human Resources', 'Marketing', 'Finance'];

  const scores = employees.map((emp) => {
    const empRecords = attendance.filter((r) => r.employeeId === emp.id);
    const workDays = empRecords.filter((r) => r.status !== 'WEEK OFF' && r.status !== 'HOLIDAY').length || 1;
    const present = empRecords.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length;
    const late = empRecords.filter((r) => r.status === 'LATE').length;
    const leaves = empRecords.filter((r) => r.status === 'ON LEAVE').length;
    const absent = empRecords.filter((r) => r.status === 'ABSENT').length;
    const totalMinutes = empRecords.reduce((acc, r) => acc + (r.workingHoursMinutes || 0), 0);
    const totalOt = empRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
    const avgMinutes = present + late > 0 ? Math.round(totalMinutes / (present + late)) : 0;

    const rate = Math.round(((present + late) / workDays) * 100);

    let tier: 'Excellent' | 'Good' | 'Average' | 'Needs Attention' = 'Good';
    if (rate >= 94) tier = 'Excellent';
    else if (rate >= 86) tier = 'Good';
    else if (rate >= 75) tier = 'Average';
    else tier = 'Needs Attention';

    return {
      employee: emp,
      rate,
      workDays,
      present,
      late,
      leaves,
      absent,
      avgMinutes,
      totalOt,
      tier,
    };
  });

  const filteredScores = scores.filter((s) => {
    const matchesSearch =
      s.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'ALL' || s.employee.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
            Workforce Attendance Scores
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Punctuality benchmarks and consistency indexes across teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-200 outline-none shadow-xs"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-white text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none shadow-xs"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredScores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <p className="text-sm font-semibold text-slate-800">No Employee Attendance Records</p>
          <p className="text-xs text-slate-500 mt-1">
            {employees.length === 0
              ? 'No employees registered yet. Add employees through the Admin Panel to see consistency scores.'
              : 'No employees matched the selected search or department filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredScores.map((s) => {
          return (
            <div
              key={s.employee.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#087A4B] font-bold flex items-center justify-center text-xs">
                      {s.employee.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{s.employee.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.employee.id} · {s.employee.department}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.tier === 'Excellent'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : s.tier === 'Good'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : s.tier === 'Average'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {s.tier}
                  </span>
                </div>

                <div className="my-4 text-center">
                  <div className="text-3xl font-extrabold text-slate-900 font-mono">
                    {s.rate}%
                  </div>
                  <span className="text-[11px] text-slate-400">Attendance Index</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Avg Daily Hours</span>
                    <span className="font-bold font-mono text-slate-900">
                      {Math.floor(s.avgMinutes / 60)}h {s.avgMinutes % 60}m
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Late Arrivals</span>
                    <span className="font-bold font-mono text-amber-700">{s.late} times</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Leaves Taken</span>
                    <span className="font-bold font-mono text-blue-700">{s.leaves} days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Overtime Accrued</span>
                    <span className="font-bold font-mono text-emerald-700">{s.totalOt} mins</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{s.workDays} business days logged</span>
                <span className="text-emerald-700 font-semibold">{s.present} on-time</span>
              </div>
            </div>
          );
        })}
      </div>
    )}
    </div>
  );
};

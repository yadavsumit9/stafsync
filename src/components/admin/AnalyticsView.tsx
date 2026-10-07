import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const AnalyticsView: React.FC = () => {
  const { employees, attendance } = useAttendance();

  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'late'>('overview');

  const totalRecords = attendance.length;
  const presentCount = attendance.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length;
  const lateCount = attendance.filter((r) => r.status === 'LATE').length;
  const leaveCount = attendance.filter((r) => r.status === 'ON LEAVE').length;
  const absentCount = attendance.filter((r) => r.status === 'ABSENT').length;

  const totalWorkMins = attendance.reduce((acc, r) => acc + (r.workingHoursMinutes || 0), 0);
  const avgMins = presentCount + lateCount > 0 ? Math.round(totalWorkMins / (presentCount + lateCount)) : 0;

  // Department comparison
  const depts = ['Engineering', 'Design', 'Operations', 'Human Resources', 'Marketing', 'Finance'];
  const deptStats = depts.map((d) => {
    const deptRecs = attendance.filter((r) => r.department === d);
    const valid = deptRecs.filter((r) => r.status !== 'WEEK OFF' && r.status !== 'HOLIDAY').length || 1;
    const p = deptRecs.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length;
    const l = deptRecs.filter((r) => r.status === 'LATE').length;
    const rate = Math.round(((p + l) / valid) * 100);
    return { name: d, rate, count: deptRecs.length };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
            Workforce Attendance Analytics
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Operational trends, department punctuality metrics, and working hours distribution
          </p>
        </div>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 block font-normal">Overall Attendance Rate</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#087A4B] font-mono">
            93.4%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">+2.1% this quarter</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 block font-normal">Avg Working Hours</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {Math.floor(avgMins / 60)}h {avgMins % 60}m
          </div>
          <span className="text-[11px] text-slate-400 font-mono font-normal">Target: 8h 0m</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 block font-normal">Total Late Occurrences</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-700 font-mono">
            {lateCount}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">4.8% of logged days</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 block font-normal">Leaves & Absences</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-blue-700 font-mono">
            {leaveCount} Leaves · {absentCount} Abs
          </div>
          <span className="text-[11px] text-slate-400 font-normal">Paid PTO quota compliant</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Attendance Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Department Punctuality Index
          </h3>
          <div className="space-y-3.5">
            {deptStats.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{d.name}</span>
                  <span className="font-mono font-bold text-[#087A4B]">{d.rate}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.rate}%` }}
                    className="h-full bg-gradient-to-r from-[#087A4B] to-emerald-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Working Hours Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Shift Compliance & Overtime Ratio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of daily recorded durations vs scheduled shift duration
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Full Standard Shift (8h - 9h)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">76% of days</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md bg-teal-500" />
                  <span className="font-semibold text-slate-800">Overtime Recorded (&gt;9h)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">14% of days</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500" />
                  <span className="font-semibold text-slate-800">Half Day / Short Hours (&lt;6h)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">4% of days</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Standard General Shift: 09:30 AM to 06:30 PM</span>
            <span className="text-[#087A4B] font-semibold">15m Grace Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Laptop,
  MapPin,
  ChevronRight,
  Coffee,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord, AttendanceStatus, WorkMode } from '../../types';
import { AttendanceDetailModal } from '../common/AttendanceDetailModal';

export const StaffAttendanceHistory: React.FC = () => {
  const { currentUser, employees, attendance } = useAttendance();
  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees[0];

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const myRecords = attendance
    .filter((r) => r.employeeId === currentEmp?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredRecords = myRecords.filter((rec) => {
    if (statusFilter === 'ALL') return true;
    return rec.status === statusFilter;
  });

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m < 10 ? '0' + m : m}m`;
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'WORKING':
        return 'bg-emerald-100 text-[#087A4B] border-emerald-200';
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ON LEAVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WEEK OFF':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HALF DAY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto animate-in fade-in pb-24 lg:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151515] tracking-tight">
            My Attendance History
          </h1>
          <p className="text-xs sm:text-sm font-normal text-[#6B7280] mt-1">
            Personal clock-in records, working duration logs, and verified attendance status
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'PRESENT', 'LATE', 'ON LEAVE', 'WEEK OFF'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-[#087A4B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-[#E6E8E7] hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Records' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E6E8E7] shadow-xs">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Total Logged Days
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-[#151515] mt-1 block font-mono">
            {myRecords.length}
          </span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E6E8E7] shadow-xs">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            On-Time Present
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-emerald-700 mt-1 block font-mono">
            {myRecords.filter((r) => r.status === 'PRESENT' || r.status === 'WORKING').length}
          </span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E6E8E7] shadow-xs">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Late Logins
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-amber-700 mt-1 block font-mono">
            {myRecords.filter((r) => r.status === 'LATE').length}
          </span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E6E8E7] shadow-xs">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Leaves Taken
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-blue-700 mt-1 block font-mono">
            {myRecords.filter((r) => r.status === 'ON LEAVE').length}
          </span>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-Friendly Card List (No horizontal scrolling!) */}
      <div className="block md:hidden space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E6E8E7] text-slate-400 text-xs">
            No attendance records match your filter.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecord(rec)}
              className="bg-white p-4 rounded-2xl border border-[#E6E8E7] shadow-xs active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#151515] font-mono">
                    {rec.date}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                      rec.status
                    )}`}
                  >
                    {rec.status}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7280] block">In Time</span>
                  <span className="font-mono font-medium text-[#151515]">
                    {rec.punchIn || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Out Time</span>
                  <span className="font-mono font-medium text-[#151515]">
                    {rec.punchOut || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Working</span>
                  <span className="font-mono font-semibold text-[#087A4B]">
                    {rec.workingHoursMinutes > 0 ? formatHours(rec.workingHoursMinutes) : '--'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#6B7280]">
                <span className="flex items-center gap-1 font-medium">
                  {rec.workMode === 'OFFICE' && <Building2 className="w-3.5 h-3.5 text-slate-500" />}
                  {rec.workMode === 'WORK FROM HOME' && <Laptop className="w-3.5 h-3.5 text-blue-500" />}
                  {rec.workMode === 'HYBRID' && <MapPin className="w-3.5 h-3.5 text-purple-500" />}
                  <span>{rec.workMode}</span>
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {rec.remarks || 'Standard verified'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABLET & DESKTOP VIEW: Clean Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E6E8E7] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Log Records ({filteredRecords.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Employee: {currentEmp?.name} ({currentEmp?.id})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[#6B7280] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Punch In & Arrival</th>
                <th className="py-3 px-4">Punch Out & Departure</th>
                <th className="py-3 px-4">Worked Hours</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-[#151515]">{rec.date}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{rec.shiftName || 'General Shift'}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[#151515] font-medium">{rec.punchIn || '--:--'}</span>
                      {rec.punchIn && (
                        <span className="text-[10px] font-semibold mt-0.5">
                          {rec.punchInStatus === 'EARLY' || (rec.earlyMinutes && rec.earlyMinutes > 0) ? (
                            <span className="text-blue-700">Early {rec.earlyMinutes}m</span>
                          ) : rec.punchInStatus === 'LATE' || (rec.lateMinutes && rec.lateMinutes > 0) ? (
                            <span className="text-amber-700">Late {rec.lateMinutes}m</span>
                          ) : (
                            <span className="text-emerald-700">On Time</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[#151515] font-medium">{rec.punchOut || '--:--'}</span>
                      {rec.punchOut && (
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                          {rec.punchOutStatus || 'NORMAL_OUT'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#151515]">
                    {rec.workingHoursMinutes > 0 ? formatHours(rec.workingHoursMinutes) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        rec.status
                      )}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {rec.overtimeMinutes > 0 ? (
                      <span className="font-semibold text-emerald-700">+{formatHours(rec.overtimeMinutes)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {rec.workMode === 'OFFICE' && <Building2 className="w-3 h-3 text-slate-500" />}
                      {rec.workMode === 'WORK FROM HOME' && <Laptop className="w-3 h-3 text-blue-500" />}
                      {rec.workMode === 'HYBRID' && <MapPin className="w-3 h-3 text-purple-500" />}
                      <span>{rec.workMode}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#087A4B] hover:text-[#075C3A]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Detail Modal */}
      {selectedRecord && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

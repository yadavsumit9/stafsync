import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Building,
  Info,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord } from '../../types';
import { AttendanceDetailModal } from '../common/AttendanceDetailModal';

export const CalendarView: React.FC = () => {
  const { employees, attendance, holidays, currentUser } = useAttendance();
  const isAdmin = currentUser?.role === 'admin';

  // If staff, lock to current staff's ID
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    currentUser?.role === 'staff' && currentUser?.employeeId
      ? currentUser.employeeId
      : employees[0]?.id || 'EMP001'
  );

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monthly schedule visual breakdown and status mapping
          </p>
        </div>

        {/* Employee Switcher (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Select Employee:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-white text-xs font-semibold text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-xs outline-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id}) · {emp.department}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calendar Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Month Navigation & Stats Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Present</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Late</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600">On Leave</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600">Holiday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-600">Week Off</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Absent</span>
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}

          {/* Blank cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[85px] sm:min-h-[105px] rounded-xl bg-slate-50/40" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const yyyy = currentYear;
            const mm = String(currentMonth + 1).padStart(2, '0');
            const dd = String(dayNum).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const record = attendance.find(
              (r) => r.employeeId === selectedEmployee?.id && r.date === dateStr
            );
            const holiday = holidays.find((h) => h.date === dateStr);
            const isToday = dateStr === '2026-10-07';

            let statusColor = 'bg-slate-50 text-slate-700 hover:bg-slate-100/80';
            let dotColor = '';

            if (holiday) {
              statusColor = 'bg-purple-50/70 border-purple-200 text-purple-900';
              dotColor = 'bg-purple-500';
            } else if (record) {
              if (record.status === 'PRESENT' || record.status === 'WORKING') {
                statusColor = 'bg-emerald-50/60 border-emerald-200 text-emerald-900';
                dotColor = 'bg-emerald-500';
              } else if (record.status === 'LATE') {
                statusColor = 'bg-amber-50/70 border-amber-200 text-amber-900';
                dotColor = 'bg-amber-500';
              } else if (record.status === 'ON LEAVE') {
                statusColor = 'bg-blue-50/70 border-blue-200 text-blue-900';
                dotColor = 'bg-blue-500';
              } else if (record.status === 'WEEK OFF') {
                statusColor = 'bg-slate-100 text-slate-600';
                dotColor = 'bg-slate-400';
              } else if (record.status === 'ABSENT') {
                statusColor = 'bg-rose-50/70 border-rose-200 text-rose-900';
                dotColor = 'bg-rose-500';
              }
            }

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (record) setSelectedRecord(record);
                }}
                className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border border-slate-200/70 flex flex-col justify-between text-left transition-all cursor-pointer hover:shadow-xs group ${statusColor} ${
                  isToday ? 'ring-2 ring-[#087A4B]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? 'bg-[#087A4B] text-white px-1.5 py-0.5 rounded-md'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
                </div>

                <div className="mt-1">
                  {holiday ? (
                    <span className="text-[10px] font-semibold text-purple-700 block truncate">
                      {holiday.name}
                    </span>
                  ) : record ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold block truncate">
                        {record.status}
                      </span>
                      {record.punchIn && (
                        <span className="text-[9px] font-mono text-slate-500 block truncate">
                          In: {record.punchIn}
                        </span>
                      )}
                      {record.workingHoursMinutes > 0 && (
                        <span className="text-[9px] font-mono text-slate-500 block truncate">
                          {Math.floor(record.workingHoursMinutes / 60)}h{' '}
                          {record.workingHoursMinutes % 60}m
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300">--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Detail Modal on day click */}
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

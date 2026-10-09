import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building,
  Edit,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Coffee,
  XCircle,
  MoreVertical,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord, AttendanceStatus, WorkMode } from '../../types';
import { AttendanceDetailModal } from '../common/AttendanceDetailModal';

export const AttendanceManagement: React.FC = () => {
  const { attendance, employees, shifts, adminAddAttendanceRecord, branding } = useAttendance();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showManualAddModal, setShowManualAddModal] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Manual Add Form State
  const [manualForm, setManualForm] = useState({
    employeeId: employees[0]?.id || '',
    date: todayStr,
    punchIn: '09:30 AM',
    punchOut: '06:30 PM',
    status: 'PRESENT' as AttendanceStatus,
    workMode: 'OFFICE' as WorkMode,
    remarks: 'Admin manual sign-in entry',
  });

  const departments = ['Engineering', 'Design', 'Operations', 'Human Resources', 'Marketing', 'Finance'];

  // Filter Attendance
  const filteredAttendance = attendance.filter((rec) => {
    if (dateRange === 'today' && rec.date !== todayStr) return false;
    if (dateRange === 'week') {
      const recDate = new Date(rec.date);
      const now = new Date();
      const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7 || diffDays < 0) return false;
    }
    if (dateRange === 'month' && !rec.date.startsWith(todayStr.slice(0, 7))) return false;

    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || rec.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    const matchesMode = workModeFilter === 'ALL' || rec.workMode === workModeFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesMode;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Date',
      'Employee ID',
      'Employee Name',
      'Department',
      'Shift',
      'Punch In',
      'Arrival Status',
      'Early Minutes',
      'Late Minutes',
      'Punch Out',
      'Departure Status',
      'Worked Hours',
      'Attendance Status',
      'Attendance Value',
      'Overtime Minutes',
      'Work Mode',
      'Calculation Source',
      'Remarks',
      'Modified By',
    ];

    const rows = filteredAttendance.map((r) => [
      r.id,
      r.date,
      r.employeeId,
      `"${r.employeeName}"`,
      r.department,
      `"${r.shiftName}"`,
      r.punchIn || '',
      r.punchInStatus || '',
      r.earlyMinutes || 0,
      r.lateMinutes || 0,
      r.punchOut || '',
      r.punchOutStatus || '',
      formatHours(r.workingHoursMinutes),
      r.status,
      r.attendanceValue ?? (r.status === 'HALF DAY' ? 0.5 : r.status === 'PRESENT' ? 1.0 : 0),
      r.overtimeMinutes || 0,
      r.workMode,
      r.calculationSource || 'SERVER_PUNCH',
      `"${r.remarks || ''}"`,
      r.modifiedBy || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safePrefix = (branding?.projectName || 'StaffSync').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${safePrefix}_Attendance_Report_${dateRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === manualForm.employeeId);
    if (!emp) return;

    const empShift = shifts.find((s) => s.id === emp.shiftId);
    const resolvedShiftName =
      emp.customTiming || (emp.shiftStartTime && emp.shiftEndTime)
        ? `${emp.name} Timing (${emp.shiftStartTime} - ${emp.shiftEndTime})`
        : empShift
        ? empShift.name
        : 'General Shift';

    const newRecord: AttendanceRecord = {
      id: `ATT_MAN_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: manualForm.date,
      shiftId: emp.shiftId || (empShift ? empShift.id : 'SHIFT_GEN'),
      shiftName: resolvedShiftName,
      punchIn: manualForm.punchIn || null,
      punchOut: manualForm.punchOut || null,
      status: manualForm.status,
      workMode: manualForm.workMode,
      workingHoursMinutes: 540,
      lateDurationMinutes: manualForm.status === 'LATE' ? 20 : 0,
      overtimeMinutes: 0,
      remarks: manualForm.remarks,
      modifiedBy: 'Admin (Manual Entry)',
      modifiedAt: new Date().toLocaleString(),
      modificationReason: 'Manual biometric roster entry',
    };

    adminAddAttendanceRecord(newRecord);
    setShowManualAddModal(false);
  };

  const formatHours = (mins: number) => {
    if (!mins) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
            Attendance Records & Audits
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Real-time biometric punch logs, overtime calculations, and administrative corrections (
            {filteredAttendance.length} records)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowManualAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mark Record</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
            title="Print Attendance"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Date Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Month (Oct 2026)
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Records
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="WORKING">Working (Live)</option>
            <option value="LATE">Late</option>
            <option value="ON LEAVE">On Leave</option>
            <option value="WEEK OFF">Week Off</option>
            <option value="HOLIDAY">Holiday</option>
            <option value="ABSENT">Absent</option>
          </select>

          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
          >
            <option value="ALL">All Work Modes</option>
            <option value="OFFICE">Office</option>
            <option value="WORK FROM HOME">Work From Home</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Punch In & Arrival</th>
                <th className="py-3.5 px-4">Punch Out & Departure</th>
                <th className="py-3.5 px-4">Worked Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Overtime</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No attendance records found for selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendance.slice(0, 50).map((rec) => {
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {rec.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-[#087A4B] transition-colors">
                            {rec.employeeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({rec.employeeId})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{rec.shiftName}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium text-slate-800">{rec.punchIn || '--:--'}</span>
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
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-600">{rec.punchOut || '--:--'}</span>
                          {rec.punchOut && (
                            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                              {rec.punchOutStatus || 'NORMAL_OUT'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                        {rec.workingHoursMinutes > 0 ? formatHours(rec.workingHoursMinutes) : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : rec.status === 'WORKING'
                              ? 'bg-emerald-100 text-[#087A4B] animate-pulse'
                              : rec.status === 'HALF DAY'
                              ? 'bg-amber-50 text-amber-700'
                              : rec.status === 'EARLY_OUT'
                              ? 'bg-rose-50 text-rose-700'
                              : rec.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700'
                              : rec.status === 'ON LEAVE'
                              ? 'bg-blue-50 text-blue-700'
                              : rec.status === 'WEEK OFF'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {rec.overtimeMinutes > 0 ? (
                          <span className="font-semibold text-emerald-700">+{formatHours(rec.overtimeMinutes)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {rec.workMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Attendance"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Manual Entry Modal */}
      {showManualAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Manual Attendance Log (Admin Override)
            </h3>
            <form onSubmit={handleManualAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Employee</label>
                <select
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 ? (
                    <option value="">No employees registered yet</option>
                  ) : (
                    employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.id}) - {e.department}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="ON LEAVE">ON LEAVE</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF DAY">HALF DAY</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Punch In Time</label>
                  <input
                    type="text"
                    value={manualForm.punchIn}
                    onChange={(e) => setManualForm({ ...manualForm, punchIn: e.target.value })}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Punch Out Time</label>
                  <input
                    type="text"
                    value={manualForm.punchOut}
                    onChange={(e) => setManualForm({ ...manualForm, punchOut: e.target.value })}
                    placeholder="06:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Work Mode</label>
                <select
                  value={manualForm.workMode}
                  onChange={(e) => setManualForm({ ...manualForm, workMode: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="OFFICE">OFFICE</option>
                  <option value="WORK FROM HOME">WORK FROM HOME</option>
                  <option value="HYBRID">HYBRID</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Justification / Reason *</label>
                <input
                  type="text"
                  value={manualForm.remarks}
                  onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A4B] text-white rounded-xl font-semibold"
                >
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
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

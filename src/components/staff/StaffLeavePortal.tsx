import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Send,
  FileText,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { LeaveType } from '../../types';

export const StaffLeavePortal: React.FC = () => {
  const { currentUser, employees, leaves, applyLeave } = useAttendance();

  const currentEmp =
    employees.find((e) => e.id === currentUser?.employeeId) ||
    employees[0];

  const myLeaves = leaves.filter((l) => l.employeeId === currentEmp?.id);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for your leave request.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setErrorMsg('End date cannot precede start date.');
      return;
    }

    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    const res = applyLeave({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      department: currentEmp.department,
      leaveType,
      startDate,
      endDate,
      totalDays: diffDays,
      reason,
      notes,
    });

    if (res.success) {
      setToastMsg('Leave application submitted successfully for Admin review!');
      setReason('');
      setNotes('');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in pb-24 lg:pb-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight">
          My Leaves & Time Off
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          Submit leave requests and monitor administrative approval decisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Apply Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Coffee className="w-5 h-5 text-[#087A4B]" />
            <h3 className="text-base font-bold text-slate-900">Apply for Leave</h3>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reason for Absence *</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly state reason..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Handover Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Work covered by teammate..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </div>

        {/* Right Column: Previous Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">My Leave Applications</h3>
              <span className="text-xs text-slate-400 font-mono">{myLeaves.length} records</span>
            </div>

            {/* Mobile View: Cards */}
            <div className="block sm:hidden p-3 space-y-2.5">
              {myLeaves.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No previous leave records found.
                </div>
              ) : (
                myLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F7F8F7] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">
                        {leave.leaveType}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span className="font-mono">
                        {leave.startDate} to {leave.endDate}
                      </span>
                      <span className="font-semibold font-mono text-[#151515]">
                        {leave.totalDays} days
                      </span>
                    </div>

                    {leave.reason && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 leading-normal">
                        {leave.reason}
                      </p>
                    )}

                    {leave.reviewRemarks && (
                      <p className="text-[10px] text-emerald-700 font-medium">
                        Admin Note: {leave.reviewRemarks}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop / Tablet View: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason & Notes</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No previous leave records found.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{leave.leaveType}</span>
                          <span className="text-[10px] text-slate-400">{leave.appliedAt}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {leave.startDate} to {leave.endDate}
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                          {leave.totalDays}d
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={leave.reason}>
                          {leave.reason}
                          {leave.reviewRemarks && (
                            <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                              Admin: {leave.reviewRemarks}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : leave.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Approved leaves automatically adjust attendance rosters.</span>
            <span className="font-semibold text-slate-800">HR Department</span>
          </div>
        </div>
      </div>
    </div>
  );
};

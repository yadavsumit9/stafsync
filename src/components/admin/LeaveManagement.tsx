import React, { useState } from 'react';
import {
  Coffee,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  AlertCircle,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { LeaveRequest, LeaveType } from '../../types';

export const LeaveManagement: React.FC = () => {
  const { leaves, employees, applyLeave, reviewLeave, currentUser } = useAttendance();
  const isAdmin = currentUser?.role === 'admin';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Add Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || 'EMP001',
    leaveType: 'Casual Leave' as LeaveType,
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    reason: '',
    notes: '',
  });

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSearch =
      l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveForm.employeeId);
    if (!emp) return;

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    applyLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: diffDays,
      reason: leaveForm.reason || 'Personal necessity',
      notes: leaveForm.notes,
    });

    setShowAddModal(false);
  };

  const handleReviewAction = (status: 'Approved' | 'Rejected') => {
    if (!reviewModalLeave) return;
    reviewLeave(reviewModalLeave.id, status, reviewRemarks);
    setReviewModalLeave(null);
    setReviewRemarks('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Leave Requests & Quotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review staff applications, track quota balances, and grant formal approvals
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Leave</span>
        </button>
      </div>

      {/* Filter and stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Pending'
              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
            {leaves.filter((l) => l.status === 'Pending').length}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Approved')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Approved'
              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Approved Leaves</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
            {leaves.filter((l) => l.status === 'Approved').length}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Rejected')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Rejected'
              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rejected Requests</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
            {leaves.filter((l) => l.status === 'Rejected').length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
              statusFilter === 'ALL' ? 'bg-[#18181B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({leaves.length})
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leave requests match the criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{leave.employeeName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{leave.employeeId}</span>
                      </td>
                      <td className="py-3.5 px-4">{leave.department}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : leave.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 animate-pulse'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {leave.status === 'Pending' && isAdmin ? (
                          <button
                            onClick={() => setReviewModalLeave(leave)}
                            className="px-3 py-1.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {leave.reviewedBy ? 'Decided' : '--'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Review Leave Application
            </h3>
            <div className="space-y-3 text-xs text-slate-600 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p>
                  <strong>Employee:</strong> {reviewModalLeave.employeeName} ({reviewModalLeave.employeeId})
                </p>
                <p>
                  <strong>Type:</strong> {reviewModalLeave.leaveType}
                </p>
                <p>
                  <strong>Dates:</strong> {reviewModalLeave.startDate} to {reviewModalLeave.endDate} (
                  {reviewModalLeave.totalDays} days)
                </p>
                <p>
                  <strong>Reason:</strong> {reviewModalLeave.reason}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Admin Remarks (Optional)</label>
                <input
                  type="text"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Approved. Have a safe journey."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setReviewModalLeave(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewAction('Rejected')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold"
              >
                Reject
              </button>
              <button
                onClick={() => handleReviewAction('Approved')}
                className="px-4 py-1.5 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-semibold"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Record Leave
            </h3>
            <form onSubmit={handleCreateLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Employee</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.id}) - {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
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
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason *</label>
                <input
                  type="text"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Doctor appointment, family function..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A4B] text-white rounded-xl font-semibold"
                >
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

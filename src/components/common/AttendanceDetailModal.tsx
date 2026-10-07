import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  User,
  Building,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit2,
  Lock,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, WorkMode } from '../../types';
import { useAttendance } from '../../context/AttendanceContext';

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  record,
  onClose,
  onUpdated,
}) => {
  const { currentUser, adminUpdateAttendance } = useAttendance();
  const isAdmin = currentUser?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [punchIn, setPunchIn] = useState(record?.punchIn || '');
  const [punchOut, setPunchOut] = useState(record?.punchOut || '');
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'PRESENT');
  const [workMode, setWorkMode] = useState<WorkMode>(record?.workMode || 'OFFICE');
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!record) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!reason.trim()) {
      setErrorMsg('Mandatory audit trail: Please enter a valid modification justification.');
      return;
    }

    const res = adminUpdateAttendance(
      record.id,
      {
        punchIn: punchIn || null,
        punchOut: punchOut || null,
        status,
        workMode,
        remarks,
      },
      reason
    );

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setIsEditing(false);
        if (onUpdated) onUpdated();
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#087A4B]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Details</h3>
              <p className="text-xs text-slate-500 font-mono">{record.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Employee & Status strip */}
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{record.employeeName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ID: {record.employeeId} · {record.department}
              </p>
              <p className="text-xs text-slate-500 mt-1">Shift: {record.shiftName}</p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'PRESENT'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : record.status === 'WORKING'
                    ? 'bg-emerald-100 text-[#087A4B] animate-pulse'
                    : record.status === 'LATE'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : record.status === 'ON LEAVE'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : record.status === 'WEEK OFF'
                    ? 'bg-slate-100 text-slate-700'
                    : record.status === 'HOLIDAY'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {record.status}
              </span>
            </div>
          </div>

          {!isEditing ? (
            /* View-only specifications */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-1">Punch In</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {record.punchIn || '--:--'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-1">Punch Out</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {record.punchOut || '--:--'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-1">Working Duration</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.workingHoursMinutes > 0 ? formatMinutes(record.workingHoursMinutes) : '0h 0m'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-1">Work Mode</span>
                  <span className="text-sm font-semibold text-slate-900">{record.workMode}</span>
                </div>
                {record.lateDurationMinutes > 0 && (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                    <span className="text-amber-700 block mb-1">Late Arrival Duration</span>
                    <span className="text-sm font-bold text-amber-800">
                      {record.lateDurationMinutes} minutes
                    </span>
                  </div>
                )}
                {record.overtimeMinutes > 0 && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="text-emerald-700 block mb-1">Overtime Recorded</span>
                    <span className="text-sm font-bold text-emerald-800">
                      {record.overtimeMinutes} minutes
                    </span>
                  </div>
                )}
              </div>

              {record.remarks && (
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 block mb-1">Remarks</span>
                  {record.remarks}
                </div>
              )}

              {/* Immutability / Audit Trail */}
              {record.modifiedBy ? (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Audit Trail: Modified by Administrator</span>
                  </div>
                  <p className="text-amber-800">
                    <strong>Admin:</strong> {record.modifiedBy} · <strong>Date:</strong> {record.modifiedAt}
                  </p>
                  <p className="text-amber-800">
                    <strong>Reason:</strong> {record.modificationReason}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Original biometric punch verified. Immutable employee record.</span>
                </div>
              )}
            </div>
          ) : (
            /* Admin Edit Form */
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Punch In Time</label>
                  <input
                    type="text"
                    value={punchIn}
                    onChange={(e) => setPunchIn(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Punch Out Time</label>
                  <input
                    type="text"
                    value={punchOut}
                    onChange={(e) => setPunchOut(e.target.value)}
                    placeholder="e.g. 06:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="WORKING">WORKING</option>
                    <option value="HALF DAY">HALF DAY</option>
                    <option value="ON LEAVE">ON LEAVE</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="WEEK OFF">WEEK OFF</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                  >
                    <option value="OFFICE">OFFICE</option>
                    <option value="WORK FROM HOME">WORK FROM HOME</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional note..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#087A4B] outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <label className="font-bold text-amber-900 block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Mandatory Audit Trail Reason *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Biometric device clock glitch, manual sign-in sheet proof"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-800 outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Corrections</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isAdmin ? 'Admin Authorization Mode' : 'Staff View Only'}
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Attendance</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-200/50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

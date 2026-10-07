import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Shift } from '../../types';

export const ShiftManagement: React.FC = () => {
  const { shifts, employees, addShift, updateShift, deleteShift, currentUser } = useAttendance();
  const isAdmin = currentUser?.role === 'admin';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:30',
    endTime: '18:30',
    gracePeriodMinutes: 15,
    minWorkingHours: 8,
    maxWorkingHours: 12,
    description: '',
  });

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name.trim()) return;

    addShift({
      id: `SHIFT_${Date.now()}`,
      name: shiftForm.name,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      gracePeriodMinutes: shiftForm.gracePeriodMinutes,
      minWorkingHours: shiftForm.minWorkingHours,
      maxWorkingHours: shiftForm.maxWorkingHours,
      description: shiftForm.description,
    });

    setShowAddModal(false);
    setShiftForm({
      name: '',
      startTime: '09:30',
      endTime: '18:30',
      gracePeriodMinutes: 15,
      minWorkingHours: 8,
      maxWorkingHours: 12,
      description: '',
    });
  };

  const handleUpdateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    updateShift(editingShift.id, editingShift);
    setEditingShift(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Work Shifts & Timing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure schedule windows, automated grace periods, and minimum hour requirements
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#087A4B] hover:bg-[#065A37] rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Shift</span>
          </button>
        )}
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shifts.map((shift) => {
          const assignedCount = employees.filter((e) => e.shiftId === shift.id).length;
          return (
            <div
              key={shift.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#087A4B] flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{shift.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{shift.id}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingShift(shift)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="Edit Shift"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {shifts.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove shift "${shift.name}"?`)) {
                              deleteShift(shift.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="my-5 p-3.5 bg-slate-50/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Working Window</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {shift.startTime} — {shift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Grace Buffer</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {shift.gracePeriodMinutes} mins
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Min Required Hours</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {shift.minWorkingHours} hours
                    </span>
                  </div>
                </div>

                {shift.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{shift.description}</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{assignedCount} employees assigned</span>
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Create New Shift Schedule
            </h3>
            <form onSubmit={handleCreateShift} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shift Name *</label>
                <input
                  type="text"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  placeholder="e.g. Night Support Shift"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grace Period (mins)</label>
                  <input
                    type="number"
                    value={shiftForm.gracePeriodMinutes}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, gracePeriodMinutes: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    min={0}
                    max={60}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Hours for Full Day</label>
                  <input
                    type="number"
                    value={shiftForm.minWorkingHours}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, minWorkingHours: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    min={1}
                    max={24}
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={shiftForm.description}
                  onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                  placeholder="Optional team or duty details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Edit Shift: {editingShift.name}
            </h3>
            <form onSubmit={handleUpdateShift} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shift Name</label>
                <input
                  type="text"
                  value={editingShift.name}
                  onChange={(e) => setEditingShift({ ...editingShift, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingShift.startTime}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingShift.endTime}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grace Period (mins)</label>
                  <input
                    type="number"
                    value={editingShift.gracePeriodMinutes}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        gracePeriodMinutes: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Hours (Full Day)</label>
                  <input
                    type="number"
                    value={editingShift.minWorkingHours}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        minWorkingHours: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A4B] text-white rounded-xl font-semibold"
                >
                  Update Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

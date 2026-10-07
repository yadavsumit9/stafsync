import React from 'react';
import {
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle,
  Hash,
  Briefcase,
} from 'lucide-react';
import { Employee, Shift } from '../../types';

interface DigitalIdCardProps {
  employee: Employee;
  shift?: Shift;
  onPrint?: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ employee, shift, onPrint }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1510] via-[#10231B] to-[#0A1A12] text-white p-6 shadow-xl border border-emerald-900/50">
      {/* Background geometric accents matching high-end access badges */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#087A4B]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative flex items-center justify-between pb-4 border-b border-emerald-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#087A4B] flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              StaffSync Pass
            </h4>
            <p className="text-[10px] text-emerald-200/70">Verified Digital Credential</p>
          </div>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{employee.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Profile Avatar / Photo */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#087A4B] via-emerald-500 to-teal-300 p-0.5 shadow-md">
            <div className="w-full h-full rounded-[14px] bg-[#12241C] flex items-center justify-center text-white text-2xl font-bold">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-[#087A4B] rounded-full text-white shadow-xs">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight">{employee.name}</h3>
          <p className="text-xs text-emerald-300 font-medium">
            {employee.designation || employee.position}
          </p>
          <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>{employee.department} Department</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-mono">
              <Hash className="w-3 h-3 text-emerald-400" />
              {employee.id}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 text-[11px]">
              <Briefcase className="w-3 h-3 text-emerald-400" />
              {employee.employmentType}
            </span>
          </div>
        </div>

        {/* QR Code Graphic Badge */}
        <div className="hidden md:flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
          <QrCode className="w-12 h-12 text-emerald-300" />
          <span className="text-[9px] font-mono text-emerald-200/60 mt-1">NFC/RFID</span>
        </div>
      </div>

      {/* Card Footer Info Grid */}
      <div className="relative mt-5 pt-4 border-t border-emerald-800/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-emerald-400/80 uppercase font-medium block">Shift Timing</span>
          <span className="font-semibold text-white">
            {shift ? `${shift.startTime} - ${shift.endTime}` : '09:30 AM - 06:30 PM'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-400/80 uppercase font-medium block">Default Mode</span>
          <span className="font-semibold text-white">{employee.defaultWorkMode}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-400/80 uppercase font-medium block">Joining Date</span>
          <span className="font-semibold text-white">{employee.joiningDate}</span>
        </div>
      </div>
    </div>
  );
};

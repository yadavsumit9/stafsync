import React from 'react';
import { Monitor, ArrowLeft, Shield, Laptop } from 'lucide-react';
import { useViewport } from '../../hooks/useViewport';
import { ProjectLogo } from './ProjectLogo';

interface AdminDesktopRequiredScreenProps {
  onBackToLogin: () => void;
}

export const AdminDesktopRequiredScreen: React.FC<AdminDesktopRequiredScreenProps> = ({
  onBackToLogin,
}) => {
  const { width } = useViewport();

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#087A4B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-slate-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Restriction Card */}
      <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-[#E6E8E7] relative z-10 text-center animate-in fade-in zoom-in-95">
        {/* Centered Company Logo */}
        <div className="flex justify-center mb-5">
          <ProjectLogo size="lg" variant="badge" />
        </div>

        {/* Desktop / Laptop Icon Representation */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#EAF6F0] flex items-center justify-center mb-5 text-[#087A4B]">
          <Monitor className="w-8 h-8 stroke-[1.75]" />
        </div>

        {/* Role Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-3">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Admin Workspace</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-[28px] font-semibold text-[#151515] tracking-tight">
          Desktop Required
        </h1>

        {/* Description matching exact specification */}
        <p className="text-sm font-normal text-[#6B7280] mt-3 leading-relaxed">
          The Admin Panel is designed for desktop and laptop screens. Please open the Admin Panel on
          a larger screen to manage employees, attendance, reports and settings.
        </p>

        {/* Resolution Specification & Dynamic Viewport Indicator */}
        <div className="mt-6 p-3.5 rounded-xl bg-[#F7F8F7] border border-[#E6E8E7] text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Recommended Screen Width</span>
            <span className="font-mono text-[#087A4B]">1200px or larger</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 font-normal text-[11px]">
            <span>Current Detected Viewport</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              {width}px
            </span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 leading-normal">
            If you are currently on a laptop or desktop computer, please maximize your browser window
            or enlarge the viewport to continue.
          </p>
        </div>

        {/* Action Button: Back to Login */}
        <div className="mt-6 pt-2">
          <button
            onClick={onBackToLogin}
            className="w-full py-3 px-4 bg-[#087A4B] hover:bg-[#075C3A] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center text-xs text-[#9CA3AF]">
        StaffSync Attendance OS · Enterprise Workforce Management
      </div>
    </div>
  );
};

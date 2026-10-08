import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Globe,
  Layout,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  X,
} from 'lucide-react';
import { useBranding } from '../../context/AttendanceContext';
import {
  validateLogoFile,
  validateFaviconFile,
  fileToDataUrl,
} from '../../utils/brandingSecurity';
import { ProjectLogoMark } from '../common/ProjectLogo';

export const BrandingSettingsCard: React.FC = () => {
  const { branding, updateBranding, resetBranding } = useBranding();

  // Local form states for staging changes before saving
  const [projectName, setProjectName] = useState(branding.projectName || 'StaffSync');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(branding.logoUrl);
  const [faviconDataUrl, setFaviconDataUrl] = useState<string | null>(branding.faviconUrl);

  // Status & error states
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Drag states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Has unsaved changes check
  const hasChanges =
    projectName.trim() !== branding.projectName ||
    logoDataUrl !== branding.logoUrl ||
    faviconDataUrl !== branding.faviconUrl;

  // Handle Logo Upload
  const handleLogoFile = async (file: File) => {
    setErrorMessage(null);
    const validation = await validateLogoFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid logo file.');
      return;
    }

    try {
      if (validation.sanitizedContent) {
        // SVG sanitized
        const blob = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
        const dataUrl = await fileToDataUrl(new File([blob], file.name, { type: 'image/svg+xml' }));
        setLogoDataUrl(dataUrl);
      } else {
        const dataUrl = await fileToDataUrl(file);
        setLogoDataUrl(dataUrl);
      }
    } catch {
      setErrorMessage('Logo upload failed. Please try again.');
    }
  };

  // Handle Favicon Upload
  const handleFaviconFile = async (file: File) => {
    setErrorMessage(null);
    const validation = await validateFaviconFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid favicon file.');
      return;
    }

    try {
      if (validation.sanitizedContent) {
        const blob = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
        const dataUrl = await fileToDataUrl(new File([blob], file.name, { type: 'image/svg+xml' }));
        setFaviconDataUrl(dataUrl);
      } else {
        const dataUrl = await fileToDataUrl(file);
        setFaviconDataUrl(dataUrl);
      }
    } catch {
      setErrorMessage('Favicon upload failed. Please try again.');
    }
  };

  // Save changes handler
  const handleSaveChanges = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectName.trim()) {
      setErrorMessage('Project Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = updateBranding({
        projectName: projectName.trim(),
        logoUrl: logoDataUrl,
        faviconUrl: faviconDataUrl,
      });

      setIsSaving(false);
      if (res.success) {
        setSuccessToast('Branding updated successfully.');
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.message || 'Unable to save branding changes. Please try again.');
      }
    }, 450);
  };

  // Reset to default handler
  const handleConfirmReset = () => {
    const res = resetBranding();
    setShowResetModal(false);
    if (res.success) {
      setProjectName('StaffSync');
      setLogoDataUrl(null);
      setFaviconDataUrl(null);
      setSuccessToast('Branding restored to default.');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#087A4B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-xs animate-in shake">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#087A4B] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Branding</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how your attendance platform appears to your organization.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* ============================================================ */}
          {/* A. PROJECT NAME                                              */}
          {/* ============================================================ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Name</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This name will appear throughout your attendance platform.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Organization Identity
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Application / Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Acme Workforce, StaffFlow, ABC Attendance"
                maxLength={48}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087A4B]/20 focus:border-[#087A4B] transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>Appears in sidebars, headers, mobile portals, login pages, and reports.</span>
                <span className="font-mono">{projectName.length}/48</span>
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* B. APPLICATION LOGO                                          */}
          {/* ============================================================ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Application Logo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your organization's custom logo. Recommended: Transparent PNG or SVG.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Max 5 MB
              </span>
            </div>

            {/* Current Logo & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200/60">
              {/* Logo Preview Display */}
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2 overflow-hidden shrink-0">
                {logoDataUrl ? (
                  <img
                    src={logoDataUrl}
                    alt="Custom Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                    <ProjectLogoMark className="w-6 h-6" fill="#FFFFFF" />
                  </div>
                )}
              </div>

              {/* Status & Options */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {logoDataUrl ? 'Custom Logo Active' : 'Default Logo Active'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {logoDataUrl
                      ? 'Custom organization logo applied across all staff and admin interfaces.'
                      : 'Using the modern built-in stylized logo mark.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                    <span>{logoDataUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                  </button>

                  {logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoDataUrl(null)}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingLogo(true);
              }}
              onDragLeave={() => setIsDraggingLogo(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingLogo(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleLogoFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => logoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDraggingLogo
                  ? 'border-[#087A4B] bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-2">
                <ImageIcon className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Drag and drop your logo here, or <span className="text-[#087A4B]">browse files</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: PNG, JPG, WEBP, SVG · Up to 5 MB
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* C. FAVICON MANAGEMENT                                        */}
          {/* ============================================================ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Favicon</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appears in browser tabs and bookmarks. Recommended: 32×32, 48×48, or square SVG.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Max 2 MB
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200/60">
              {/* Favicon Square Preview */}
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2 overflow-hidden shrink-0">
                {faviconDataUrl ? (
                  <img
                    src={faviconDataUrl}
                    alt="Custom Favicon Preview"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                    <ProjectLogoMark className="w-4 h-4" fill="#FFFFFF" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {faviconDataUrl ? 'Custom Favicon Active' : 'Default Favicon Active'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dynamically replaces the browser tab icon across Chrome, Safari, Firefox, Edge, and mobile.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                    <span>{faviconDataUrl ? 'Replace Favicon' : 'Upload Favicon'}</span>
                  </button>

                  {faviconDataUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconDataUrl(null)}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFavicon(true);
              }}
              onDragLeave={() => setIsDraggingFavicon(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFavicon(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFaviconFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => faviconInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDraggingFavicon
                  ? 'border-[#087A4B] bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg,.webp,image/x-icon,image/png,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFaviconFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-1.5">
                <Globe className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click or drag to upload favicon
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: ICO, PNG, SVG, WEBP · Up to 2 MB
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Preview & Action Bar */}
        <div className="space-y-6">
          {/* ============================================================ */}
          {/* D. LIVE PREVIEW CARD                                         */}
          {/* ============================================================ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#087A4B]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Preview
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
            </div>

            {/* 1. Browser Tab Simulation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Browser Tab Preview
              </span>
              <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-2 border border-slate-200/60 max-w-full">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {faviconDataUrl ? (
                      <img
                        src={faviconDataUrl}
                        alt="Favicon"
                        className="w-3.5 h-3.5 object-contain"
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded bg-black flex items-center justify-center text-white">
                        <ProjectLogoMark className="w-2.5 h-2.5" fill="#FFF" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {projectName || 'StaffSync'} — Dashboard
                  </span>
                  <X className="w-3 h-3 text-slate-300 ml-auto shrink-0" />
                </div>
              </div>
            </div>

            {/* 2. Sidebar Brand Simulation */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Sidebar Brand Header
              </span>
              <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center gap-2.5 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {logoDataUrl ? (
                    <img
                      src={logoDataUrl}
                      alt="Brand Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ProjectLogoMark className="w-5 h-5 text-white" fill="#FFF" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {projectName || 'StaffSync'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Workforce OS</div>
                </div>
              </div>
            </div>

            {/* 3. Login Screen Simulation */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Login Screen Banner
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto p-1 shadow-2xs">
                  {logoDataUrl ? (
                    <img
                      src={logoDataUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                      <ProjectLogoMark className="w-3.5 h-3.5" fill="#FFF" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  Welcome to {projectName || 'StaffSync'}
                </div>
                <div className="text-[10px] text-slate-400">Sign in to your organization</div>
              </div>
            </div>

            {/* Multi-Tenant Security Note */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-[#087A4B] shrink-0 mt-0.5" />
              <span>
                Isolated per organization tenant (<code className="font-mono text-[10px]">{branding.organizationId}</code>). Customizations apply instantly without rebuilding.
              </span>
            </div>

            {/* Save / Reset Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-[#087A4B] hover:bg-[#065A37] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RESET BRANDING CONFIRMATION MODAL                            */}
      {/* ============================================================ */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Branding?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will restore the default project name (<span className="font-mono font-semibold">StaffSync</span>), default stylized logo, and default favicon for your organization.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors"
              >
                Reset Branding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

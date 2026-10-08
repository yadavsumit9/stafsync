import React, { useState } from 'react';
import { useBranding } from '../../context/AttendanceContext';

interface ProjectLogoProps {
  className?: string;
  iconClassName?: string;
  variant?: 'badge' | 'icon' | 'badge-emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl?: string | null;
  altText?: string;
}

export const ProjectLogoMark: React.FC<{ className?: string; fill?: string }> = ({
  className = 'w-5 h-5',
  fill = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top stylized droplet */}
      <path
        d="M 174 20 L 68 20 A 40 40 0 1 0 94.4 90.0 L 174 20 Z"
        fill={fill}
      />
      {/* Bottom stylized droplet (180° rotation) */}
      <path
        d="M 26 180 L 132 180 A 40 40 0 1 0 105.6 110.0 L 26 180 Z"
        fill={fill}
      />
    </svg>
  );
};

export const ProjectLogo: React.FC<ProjectLogoProps> = ({
  className = '',
  iconClassName = '',
  variant = 'badge',
  size = 'sm',
  customLogoUrl,
  altText,
}) => {
  const { branding } = useBranding();
  const [imgError, setImgError] = useState(false);

  const activeLogoUrl = customLogoUrl !== undefined ? customLogoUrl : branding?.logoUrl;
  const projectName = branding?.projectName || 'StaffSync';

  const sizeMap = {
    xs: { badge: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4', img: 'max-h-5 max-w-5' },
    sm: { badge: 'w-8 h-8 rounded-xl', icon: 'w-4.5 h-4.5', img: 'max-h-6 max-w-6' },
    md: { badge: 'w-10 h-10 rounded-xl', icon: 'w-5.5 h-5.5', img: 'max-h-8 max-w-8' },
    lg: { badge: 'w-12 h-12 rounded-2xl', icon: 'w-7 h-7', img: 'max-h-9 max-w-9' },
    xl: { badge: 'w-16 h-16 rounded-2xl', icon: 'w-9 h-9', img: 'max-h-12 max-w-12' },
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  // If a valid custom logo is available and hasn't failed to load
  if (activeLogoUrl && !imgError) {
    if (variant === 'icon') {
      return (
        <img
          src={activeLogoUrl}
          alt={altText || projectName}
          className={`${iconClassName || currentSize.icon} object-contain`}
          onError={() => setImgError(true)}
        />
      );
    }

    return (
      <div
        className={`${currentSize.badge} bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 overflow-hidden shrink-0 transition-transform ${className}`}
      >
        <img
          src={activeLogoUrl}
          alt={altText || projectName}
          className={`${currentSize.img} object-contain w-full h-full`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to default stylized logo mark
  if (variant === 'icon') {
    return <ProjectLogoMark className={iconClassName || currentSize.icon} />;
  }

  const badgeStyle =
    variant === 'badge-emerald'
      ? 'bg-gradient-to-br from-[#087A4B] to-[#044D2F] text-white shadow-xs'
      : 'bg-black text-white shadow-xs border border-white/10';

  return (
    <div
      className={`${currentSize.badge} ${badgeStyle} flex items-center justify-center shrink-0 transition-transform ${className}`}
    >
      <ProjectLogoMark
        className={`${iconClassName || currentSize.icon} text-white`}
        fill="#FFFFFF"
      />
    </div>
  );
};

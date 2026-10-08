import React from 'react';

interface ProjectLogoProps {
  className?: string;
  iconClassName?: string;
  variant?: 'badge' | 'icon' | 'badge-emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
}) => {
  const sizeMap = {
    xs: { badge: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4' },
    sm: { badge: 'w-8 h-8 rounded-xl', icon: 'w-4.5 h-4.5' },
    md: { badge: 'w-10 h-10 rounded-xl', icon: 'w-5.5 h-5.5' },
    lg: { badge: 'w-12 h-12 rounded-2xl', icon: 'w-7 h-7' },
    xl: { badge: 'w-16 h-16 rounded-2xl', icon: 'w-9 h-9' },
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

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

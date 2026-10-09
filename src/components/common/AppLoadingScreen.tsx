import React from 'react';

export const AppLoadingScreen: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F9F8] select-none"
    >
      <div className="w-6 h-6 rounded-full border-2 border-[#E6E8E7] border-t-[#087A4B] animate-spin" />
    </div>
  );
};

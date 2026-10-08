import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Coffee,
  User,
} from 'lucide-react';

interface StaffMobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingLeavesCount?: number;
}

export const StaffMobileBottomNav: React.FC<StaffMobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingLeavesCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leaves', label: 'Leave', icon: Coffee, badge: pendingLeavesCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Staff mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6E8E7] px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] lg:hidden"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
                isActive ? 'text-[#087A4B]' : 'text-[#6B7280] hover:text-[#151515]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75]'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#087A4B] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[11px] mt-1 transition-colors ${
                  isActive ? 'font-semibold text-[#087A4B]' : 'font-medium text-[#6B7280]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#087A4B] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

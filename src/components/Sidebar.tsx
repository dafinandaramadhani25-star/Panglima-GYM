import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  CalendarClock, 
  History, 
  Users, 
  LogOut, 
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

export type SidebarTab = 'dashboard' | 'catalog' | 'maintenance' | 'logs' | 'users';

interface SidebarProps {
  currentTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  user: { email: string; displayName: string };
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as SidebarTab, label: 'Dasbor', icon: LayoutDashboard },
    { id: 'catalog' as SidebarTab, label: 'Katalog Barang', icon: Database },
    { id: 'maintenance' as SidebarTab, label: 'Jadwal Perawatan', icon: CalendarClock },
    { id: 'logs' as SidebarTab, label: 'Log Stok', icon: History },
    { id: 'users' as SidebarTab, label: 'Manajemen User', icon: Users },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-[#121212] border-r border-[#2A2A2A] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 bg-[#00C853] rounded flex items-center justify-center font-bold text-black font-semibold text-lg shrink-0">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base leading-none">GymStock</span>
              <span className="text-[10px] font-bold text-[#00C853] font-sans">PRO</span>
            </div>
            <p className="text-[10px] text-[#8E8E8E] font-mono tracking-wider mt-0.5">PANGLIMA GYM</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto font-sans">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1A1A1A] text-[#00C853]'
                  : 'text-[#8E8E8E] hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00C853]' : 'text-[#8E8E8E]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info / Status & Sign Out panel */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#121212] space-y-4">
        {/* Connection health indicator */}
        <div className="flex items-center justify-between px-2 pt-1 font-mono">
          <span className="text-[10px] uppercase text-[#8E8E8E] tracking-wider">Database Status</span>
          {isFirebaseConfigured ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cloud
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono" title="Menggunakan LocalStorage">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Local Sync
            </span>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
          {/* User Initial Circle */}
          <div className="w-9 h-9 rounded-full bg-[#2A2A2A] border border-[#333333] text-white flex items-center justify-center font-semibold font-mono text-xs shadow-inner uppercase">
            {user.displayName ? user.displayName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">{user.displayName || 'Operator'}</p>
            <p className="text-[10px] text-[#8E8E8E] truncate leading-tight font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Logout Toggle */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8E8E8E] hover:text-red-450 border border-[#2A2A2A] hover:border-red-500/20 bg-transparent hover:bg-red-500/[0.02] transition-all cursor-pointer font-sans"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}

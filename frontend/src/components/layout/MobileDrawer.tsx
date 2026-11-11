import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flag,
  BookOpen,
  Compass,
  Trophy,
  Award,
  User,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, admin, logout } = useAuth();
  const currentUser = user || admin;

  if (!isOpen) return null;

  const sections = [
    {
      title: 'Learning',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Challenges', path: '/challenges', icon: Flag, badge: '50' },
        { label: 'Security Knowledge', path: '/knowledge', icon: BookOpen, badge: '50' },
        { label: 'Learning Paths', path: '/learning-paths', icon: Compass },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { label: 'Achievements', path: '/achievements', icon: Award },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-cyber-sidebar border-r border-cyber-border h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-cyber-border">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center space-x-3"
          >
            <img
              src="/logo-icon.png"
              alt="WebSec CTF"
              className="w-9 h-9 rounded-lg object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-cyber-text font-mono flex items-center">
                websec<span className="text-emerald-400 font-extrabold">.ctf</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono truncate">
                &gt; capture the flag
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 mb-1.5 text-[10px] font-mono tracking-wider uppercase text-cyber-muted/80">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
                      )
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-elevated text-emerald-400 border border-emerald-800/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-border bg-cyber-card/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserAvatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.username || 'Player'}
              size="xs"
              role={currentUser?.role}
            />
            <div className="text-xs">
              <div className="font-semibold text-cyber-text">{currentUser?.username || 'Player'}</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {currentUser?.role === 'ADMIN' ? 'Security Admin' : 'Researcher'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="p-1.5 rounded-lg text-cyber-muted hover:text-rose-400 hover:bg-cyber-elevated"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;

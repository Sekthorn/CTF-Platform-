import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flag,
  Compass,
  Trophy,
  Award,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';
import { apiClient } from '@/services/api';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onNavigate,
}) => {
  const { user, admin, logout, isAdmin } = useAuth();
  const currentUser = user || admin;

  const [challengeCount, setChallengeCount] = useState<number>(63);
  const [knowledgeCount, setKnowledgeCount] = useState<number>(63);

  // Floating Cyber Tooltip State for Collapsed Mode
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    label: string;
    section?: string;
    badge?: string;
    top: number;
  } | null>(null);

  const showTooltip = (
    e: React.MouseEvent<HTMLElement>,
    label: string,
    section?: string,
    badge?: string
  ) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      label,
      section,
      badge,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setHoveredTooltip(null);
  };

  useEffect(() => {
    if (!collapsed) {
      setHoveredTooltip(null);
    }
  }, [collapsed]);

  useEffect(() => {
    apiClient
      .get('/challenges', { params: { limit: 1 } })
      .then((res) => {
        const total = res.data?.data?.pagination?.total ?? res.data?.pagination?.total;
        if (typeof total === 'number' && total > 0) {
          setChallengeCount(total);
        }
      })
      .catch(() => {});

    apiClient
      .get('/knowledge', { params: { limit: 1 } })
      .then((res) => {
        const total =
          res.data?.data?.pagination?.total ??
          res.data?.pagination?.total ??
          (Array.isArray(res.data?.data) ? res.data.data.length : null) ??
          (Array.isArray(res.data) ? res.data.length : null);
        if (typeof total === 'number' && total > 0) {
          setKnowledgeCount(total);
        }
      })
      .catch(() => {});
  }, []);

  const platformItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Challenges', path: '/challenges', icon: Flag, badge: String(challengeCount) },
    { label: 'Security Knowledge', path: '/knowledge', icon: BookOpen, badge: String(knowledgeCount) },
    { label: 'Learning Progress', path: '/learning-progress', icon: TrendingUp },
  ];

  const adminItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Challenges', path: '/admin/challenges', icon: Flag, badge: String(challengeCount) },
    { label: 'Knowledge Admin', path: '/admin/knowledge', icon: BookOpen, badge: String(knowledgeCount) },
  ];

  if (isAdmin) {
    adminItems.push({ label: 'Admin Management', path: '/admin/admins', icon: Users });
  }

  const platformOverviewItems: NavItem[] = [
    ...(isAdmin ? [{ label: 'Security Knowledge', path: '/knowledge', icon: BookOpen }] : []),
    { label: 'Learning Paths', path: '/learning-paths', icon: Compass },
    { label: 'Scoreboard', path: '/leaderboard', icon: Trophy },
    { label: 'Achievements', path: '/achievements', icon: Award },
  ];

  const sections: NavSection[] = [
    {
      title: isAdmin ? 'Administration' : 'CTF Arena',
      items: isAdmin ? adminItems : platformItems,
    },
    {
      title: 'Platform Overview',
      items: platformOverviewItems,
    },
    {
      title: 'Account',
      items: [
        { label: isAdmin ? 'Admin Profile' : 'My Profile', path: '/profile', icon: User },
        { label: isAdmin ? 'System Settings' : 'Account Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside
      onMouseLeave={hideTooltip}
      className={cn(
        'h-screen flex flex-col bg-cyber-sidebar border-r border-cyber-border transition-all duration-300 select-none z-20 font-sans relative',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-cyber-border',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        {collapsed ? (
          <button
            onClick={() => {
              hideTooltip();
              onToggleCollapse();
            }}
            onMouseEnter={(e) => showTooltip(e, 'Expand Sidebar', 'Navigation')}
            onMouseLeave={hideTooltip}
            className="w-12 h-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-all cursor-pointer group relative"
            aria-label="Expand Sidebar"
          >
            <img
              src="/logo-icon.png"
              alt="WebSec CTF Logo"
              className="w-10 h-10 rounded-lg object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(44,255,122,0.35)]"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyber-elevated border border-cyber-border flex items-center justify-center text-[9px] text-cyber-muted group-hover:text-emerald-400">
              <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </button>
        ) : (
          <>
            <NavLink
              to="/"
              onClick={onNavigate}
              className="flex items-center space-x-3 overflow-hidden group"
            >
              <img
                src="/logo-icon.png"
                alt="WebSec CTF"
                className="w-11 h-11 rounded-xl object-contain group-hover:scale-105 transition-transform flex-shrink-0 drop-shadow-[0_0_10px_rgba(44,255,122,0.35)]"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[15px] tracking-tight text-cyber-text font-mono flex items-center leading-tight">
                  websec<span className="text-emerald-400 font-black">.ctf</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono tracking-tight truncate opacity-90 mt-0.5">
                  &gt; capture the flag ■
                </span>
              </div>
            </NavLink>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {sections.map((section, idx) => (
          <div key={section.title} className="space-y-1">
            {collapsed ? (
              idx > 0 && <div className="my-2.5 border-t border-cyber-border/50 mx-2" />
            ) : (
              <div className="px-2.5 mb-1.5 text-[10px] font-mono tracking-wider uppercase text-cyber-muted/80">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    hideTooltip();
                    onNavigate?.();
                  }}
                  onMouseEnter={(e) => showTooltip(e, item.label, section.title, item.badge)}
                  onMouseLeave={hideTooltip}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                        : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated/70 border border-transparent',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'w-4 h-4 flex-shrink-0 transition-colors',
                          isActive ? 'text-emerald-400' : 'text-cyber-muted group-hover:text-cyber-text'
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-elevated text-emerald-400 border border-emerald-800/30">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-cyber-border space-y-2 bg-cyber-sidebar">
        <NavLink
          to="/profile"
          onClick={() => {
            hideTooltip();
            onNavigate?.();
          }}
          onMouseEnter={(e) =>
            showTooltip(
              e,
              currentUser?.username || 'Researcher Profile',
              currentUser?.role === 'ADMIN' ? 'Security Admin' : 'Researcher Account'
            )
          }
          onMouseLeave={hideTooltip}
          className={cn(
            'flex items-center space-x-3 p-2 rounded-lg hover:bg-cyber-elevated/60 transition-colors group',
            collapsed && 'justify-center px-0'
          )}
        >
          <UserAvatar
            src={currentUser?.avatarUrl}
            alt={currentUser?.username || 'User Profile'}
            size="sm"
            role={currentUser?.role}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-cyber-text truncate group-hover:text-emerald-400 transition-colors">
                {currentUser?.username || 'Player'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono truncate">
                {currentUser?.role === 'ADMIN' ? 'Security Admin' : 'Player Account'}
              </div>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => {
            hideTooltip();
            handleLogout();
          }}
          onMouseEnter={(e) => showTooltip(e, 'Logout Session', 'Authentication')}
          onMouseLeave={hideTooltip}
          className={cn(
            'w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-xs font-medium text-cyber-muted hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="pt-1 text-[10px] font-mono text-cyber-muted/50 text-center tracking-tight">
            © 2026 SEK Thorn. All rights reserved.
          </div>
        )}
      </div>

      {/* Floating Cyber Tooltip for Collapsed Sidebar */}
      {collapsed && hoveredTooltip && (
        <div
          className="fixed z-50 pointer-events-none -translate-y-1/2 flex items-center px-3 py-1.5 rounded-lg bg-[#0e1726]/95 border border-emerald-500/40 text-cyber-text text-xs font-mono shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{ left: '86px', top: hoveredTooltip.top }}
        >
          {/* Arrow pointing back to the icon */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#0e1726] border-l border-b border-emerald-500/50" />

          <div className="flex flex-col min-w-0">
            {hoveredTooltip.section && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/70 leading-tight">
                {hoveredTooltip.section}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyber-text tracking-wide whitespace-nowrap">
                {hoveredTooltip.label}
              </span>
              {hoveredTooltip.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/50 font-bold">
                  {hoveredTooltip.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

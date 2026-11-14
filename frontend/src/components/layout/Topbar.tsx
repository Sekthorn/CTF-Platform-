import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  CheckCircle2,
  Flag,
  Zap,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';
import { mockChallenges } from '@/data/mock/challenges';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, admin, logout, isAdmin } = useAuth();
  const currentUser = user || admin;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live matching challenges
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return mockChallenges
      .filter((c) => {
        const cat =
          typeof c.category === 'string'
            ? c.category
            : (c.category as any)?.name || '';
        return (
          c.title.toLowerCase().includes(q) ||
          c.shortDescription?.toLowerCase().includes(q) ||
          c.owaspReference?.toLowerCase().includes(q) ||
          c.cweReference?.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [searchQuery]);

  const getPageContext = (pathname: string) => {
    if (pathname.startsWith('/challenges/') || pathname.startsWith('/admin/challenges/')) {
      return { title: 'Challenge Workspace', subtitle: 'Interactive Penetration Testing Target' };
    }
    switch (pathname) {
      case '/':
      case '/admin/dashboard':
        return { title: 'Admin Dashboard', subtitle: 'Platform Health, Analytics & Challenges' };
      case '/admin/admins':
      case '/admin/management':
        return { title: 'Admin Management', subtitle: 'Manage Administrators & Security Audit Trail' };
      case '/admin/audit-logs':
        return { title: 'Audit Trail', subtitle: 'Tamper-Evident Security Event Log' };
      case '/challenges':
      case '/admin/challenges':
        return { title: 'Challenges', subtitle: 'Hands-on Web Security Labs' };
      case '/learning-paths':
        return { title: 'Learning Paths', subtitle: 'Offensive Security Roadmap' };
      case '/labs':
      case '/admin/labs':
        return { title: 'Practice Labs', subtitle: 'Dedicated Vulnerability Environments' };
      case '/leaderboard':
        return { title: 'Leaderboard', subtitle: 'Global Player Scoreboard' };
      case '/achievements':
        return { title: 'Achievements', subtitle: 'Exploitation Badges & Milestones' };
      case '/profile':
        return { title: 'Researcher Profile', subtitle: 'Personal Statistics & Solve History' };
      case '/settings':
        return {
          title: isAdmin ? 'Platform Settings' : 'Account Settings',
          subtitle: isAdmin
            ? 'Preferences & System Configurations'
            : 'Preferences & Account Configurations',
        };
      case '/docs':
        return { title: 'Documentation', subtitle: 'Standards & Rules of Engagement' };
      default:
        return { title: 'WebSec CTF', subtitle: 'Practical Penetration Testing Platform' };
    }
  };

  const { title, subtitle } = getPageContext(location.pathname);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/challenges?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSelectChallenge = (slug: string) => {
    navigate(`/challenges/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-bg/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-bold text-cyber-text tracking-tight">
              {title}
            </h2>
            <span className="hidden sm:inline-flex text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded font-mono font-medium">
              CTF LIVE
            </span>
          </div>
          <p className="text-[11px] text-cyber-muted font-sans hidden lg:block leading-none mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications & Profile */}
      <div className="flex items-center space-x-3">
        {/* Search Bar with Live Cyber Dropdown */}
        <div ref={searchRef} className="relative hidden sm:block w-48 sm:w-60 md:w-72 lg:w-80">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-cyber-muted pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              placeholder="Search challenges or CWE..."
              className="pl-8 pr-8 text-xs h-9 bg-cyber-card border-cyber-border text-cyber-text placeholder:text-cyber-muted/60 focus-visible:ring-emerald-500/50 rounded-lg w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-2.5 text-cyber-muted hover:text-cyber-text transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Live Search Results Popup */}
          {isSearchOpen && searchQuery.trim().length >= 1 && (
            <div className="absolute top-full mt-2 right-0 w-80 md:w-96 rounded-xl border border-cyber-border bg-cyber-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden divide-y divide-cyber-border/60">
              <div className="px-3.5 py-2 bg-cyber-bg/80 flex items-center justify-between text-[10px] font-mono text-cyber-muted">
                <span>MATCHING CHALLENGES</span>
                <span>{searchResults.length} shown</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-cyber-border/40">
                {searchResults.length > 0 ? (
                  searchResults.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChallenge(c.slug)}
                      className="p-2.5 sm:p-3 hover:bg-cyber-elevated/70 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-cyber-text group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {c.title}
                          </span>
                          <DifficultyBadge difficulty={c.difficulty} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-muted truncate">
                          <span>{typeof c.category === 'object' && c.category !== null ? (c.category as any).name : c.category}</span>
                          {c.cweReference && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400 font-semibold">{c.cweReference}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +{c.points}
                        </span>
                        <span className="text-[9px] text-cyber-muted block font-mono">PTS</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center space-y-1 text-xs">
                    <p className="text-cyber-muted">No challenges matching "{searchQuery}"</p>
                    <p className="text-[10px] text-cyber-muted/60 font-mono">
                      Try searching by CWE (e.g. CWE-89) or vulnerability name.
                    </p>
                  </div>
                )}
              </div>

              <div
                onClick={() => handleSearchSubmit()}
                className="px-3.5 py-2.5 bg-cyber-bg/90 hover:bg-cyber-elevated text-center text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all results in Challenges</span>
                <span>→</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-cyber-border bg-cyber-card shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
                <span className="text-xs font-semibold text-cyber-text font-mono">Platform Feed</span>
                <span className="text-[10px] text-emerald-400 font-mono">3 New</span>
              </div>
              <div className="divide-y divide-cyber-border/60 text-xs">
                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Flag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-cyber-text font-medium text-[11px]">Unionized Infiltration Solved</p>
                    <p className="text-cyber-muted text-[10px]">You earned +100 points for successful exploitation.</p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-cyber-text font-medium text-[11px]">New Lab: SSRF Metadata Leak</p>
                    <p className="text-cyber-muted text-[10px]">New AWS IMDSv1 extraction scenario published.</p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-cyber-text font-medium text-[11px]">Badge Unlocked: Injection Specialist</p>
                    <p className="text-cyber-muted text-[10px]">Solved all beginner SQLi challenges.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-cyber-elevated transition-colors border border-transparent hover:border-cyber-border"
          >
            <UserAvatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.username || 'Player'}
              size="xs"
              role={currentUser?.role}
              showGlow={isAdmin}
            />
            <div className="text-left hidden md:block">
              <span className="block text-xs font-semibold text-cyber-text leading-tight">
                {currentUser?.username || 'Player'}
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-mono leading-none bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.5 rounded font-medium">
                  <Shield className="w-2.5 h-2.5" /> ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400 font-mono leading-none bg-cyan-950/60 border border-cyan-800/40 px-1 py-0.5 rounded font-medium">
                  <User className="w-2.5 h-2.5" /> PLAYER
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-cyber-muted hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-cyber-border bg-cyber-card shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-cyber-border mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-cyber-text">{currentUser?.username || 'Player'}</p>
                  <span className={`text-[9px] font-mono px-1 rounded ${isAdmin ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40' : 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/40'}`}>
                    {isAdmin ? 'ADMIN' : 'PLAYER'}
                  </span>
                </div>
                <p className="text-[10px] text-cyber-muted truncate font-mono mt-0.5">{currentUser?.email || 'player@websec.ctf'}</p>
              </div>

              {isAdmin && (
                <Link
                  to="/admin/management"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Admin Management</span>
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </Link>

              <Link
                to="/docs"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated rounded-lg transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Documentation</span>
              </Link>

              <div className="border-t border-cyber-border my-1" />

              <button
                type="button"
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  User,
  Shield,
  Save,
  CheckCircle2,
  Info,
  Sliders,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Terminal,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { ANIME_AVATARS, getAvatarUrl } from '@/data/avatars';

type Tab = 'profile' | 'account' | 'preferences';

export const SettingsPage: React.FC = () => {
  const { user, admin, updateUserProfile, isAdmin } = useAuth();
  const currentUser = user || admin;

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form state
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [email, setEmail] = useState(currentUser?.email || 'admin@websec.ctf');
  const [avatarUrl, setAvatarUrl] = useState(
    getAvatarUrl(currentUser?.avatarUrl)
  );

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username) setUsername(currentUser.username);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.avatarUrl) setAvatarUrl(getAvatarUrl(currentUser.avatarUrl));
    }
  }, [currentUser]);

  // Local preferences
  const [soundEffects, setSoundEffects] = useState(true);
  const [showHintsWarning, setShowHintsWarning] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    apiClient
      .get('/users/me')
      .then((res) => {
        if (res.data?.data) {
          const u = res.data.data;
          if (u.username) setUsername(u.username);
          if (u.email) setEmail(u.email);
          if (u.avatarUrl) setAvatarUrl(u.avatarUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await apiClient.patch('/users/me', { avatarUrl });
      updateUserProfile({ avatarUrl });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Local fallback
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar =
    ANIME_AVATARS.find((a) => a.url === avatarUrl) || ANIME_AVATARS[0];

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-[1720px] mx-auto font-sans pb-10">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyber-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
            <Sparkles className="w-3 h-3" />
            Researcher Configuration
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            {isAdmin ? 'Platform Settings' : 'Account Settings'}
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted mt-0.5">
            Manage your research identity, cyber persona, preferences, and account configurations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SESSION ACTIVE
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form & Settings Controls (8 Cols on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-cyber-border/70 space-x-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-3.5 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Information</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center space-x-2 px-3.5 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'account'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Account & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center space-x-2 px-3.5 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'preferences'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>UI Preferences</span>
            </button>
          </div>

          {/* Tab 1: Profile Information */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
                  <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    Public Researcher Identity
                  </h3>
                  <span className="text-[10px] font-mono text-cyber-muted">
                    Visible on Leaderboards & Solves
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-cyber-text font-medium block">Username</label>
                    <Input
                      value={username}
                      disabled
                      className="h-9 bg-cyber-elevated/50 border-cyber-border text-cyber-muted cursor-not-allowed font-mono text-xs rounded-lg"
                    />
                    <p className="text-[10px] text-cyber-muted">
                      Usernames are uniquely assigned during registration.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-cyber-text font-medium block">Email Address</label>
                    <Input
                      value={email}
                      disabled
                      className="h-9 bg-cyber-elevated/50 border-cyber-border text-cyber-muted cursor-not-allowed font-mono text-xs rounded-lg"
                    />
                    <p className="text-[10px] text-cyber-muted">
                      Associated with authenticated security credentials.
                    </p>
                  </div>
                </div>

                {/* Anime Avatar Picker */}
                <div className="pt-2">
                  <AvatarPicker
                    value={avatarUrl}
                    onChange={(newUrl) => setAvatarUrl(newUrl)}
                    isSaving={isSaving}
                  />
                </div>

                {/* Submit Toolbar */}
                <div className="pt-4 border-t border-cyber-border/70 flex items-center justify-between">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-4 font-mono font-medium shadow-md shadow-emerald-950/40"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" /> {isSaving ? 'Saving...' : 'Save Avatar & Profile'}
                  </Button>
                  {savedSuccess && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Changes saved successfully
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Tab 2: Account & Security */}
          {activeTab === 'account' && (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
                <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Security & Authentication Architecture
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  JWT / RBAC Active
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cyber-elevated/60 border border-cyber-border space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-cyber-text">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>Platform Security Protocol</span>
                </div>
                <p className="text-cyber-muted leading-relaxed">
                  Your session is protected via cryptographic JSON Web Tokens (JWT) and database-backed refresh token rotation. Sensitive actions utilize argon2/bcrypt salted hashes and strict server-side authorization filters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">Account Role</span>
                  <p className="font-bold text-emerald-400">
                    {isAdmin ? 'ROOT ADMINISTRATOR' : 'SECURITY RESEARCHER'}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">Session Algorithm</span>
                  <p className="font-bold text-cyan-300">HS256 JWT (15m)</p>
                </div>

                <div className="p-3 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">Refresh Window</span>
                  <p className="font-bold text-cyber-text">7 Days Rotation</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>Two-Factor Authentication (2FA / TOTP)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
                  Enforced for Admin Roles
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: UI Preferences */}
          {activeTab === 'preferences' && (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
                <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Workspace & Audio Preferences
                </h3>
                <span className="text-[10px] font-mono text-cyber-muted">
                  Client-Side State
                </span>
              </div>

              <div className="space-y-3 divide-y divide-cyber-border/60 text-xs">
                <div className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cyber-text">Audio Feedback & Sound Effects</p>
                    <p className="text-[11px] text-cyber-muted">Play acoustic confirmation chimes upon capturing flags and submitting solutions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={(e) => setSoundEffects(e.target.checked)}
                    className="w-4 h-4 rounded border-cyber-border bg-cyber-bg text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cyber-text">Hint Cost Confirmation</p>
                    <p className="text-[11px] text-cyber-muted">Require an explicit confirmation dialog before unlocking hint penalty points in the lab.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showHintsWarning}
                    onChange={(e) => setShowHintsWarning(e.target.checked)}
                    className="w-4 h-4 rounded border-cyber-border bg-cyber-bg text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cyber-text">Platform Updates Feed</p>
                    <p className="text-[11px] text-cyber-muted">Surface live notification alerts when new vulnerability scenarios and learning modules are released.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 rounded border-cyber-border bg-cyber-bg text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Cyberpunk Identity Dossier & Security Overview (4 Cols on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Live Persona ID Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 via-cyber-card to-cyber-card p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-cyber-border/50 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Arena Dossier
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                ACTIVE IDENTITY
              </span>
            </div>

            {/* Avatar & Persona Details */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] overflow-hidden bg-cyber-bg transition-transform hover:scale-105">
                  <img
                    src={avatarUrl}
                    alt={currentAvatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyber-card border-2 border-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-bold text-base text-cyber-text tracking-wide font-mono">
                    {username}
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                    YOU
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-mono font-semibold">
                  {currentAvatar.name}
                </p>
                <p className="text-[11px] text-cyber-muted font-mono leading-tight">
                  {currentAvatar.role}
                </p>
              </div>
            </div>

            {/* Quick Dossier Matrix */}
            <div className="rounded-lg border border-cyber-border/70 bg-cyber-elevated/40 p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">Clearance:</span>
                <span className="text-cyan-300 font-medium">
                  {isAdmin ? 'Master Security Admin' : 'Security Researcher'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">Target Status:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Arena Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">Auth Protocol:</span>
                <span className="text-cyber-text text-[11px]">JWT Bearer / nosniff</span>
              </div>
            </div>

            {/* Link to Public Profile */}
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-cyber-border bg-cyber-elevated/80 hover:bg-cyber-elevated text-cyber-text text-xs font-mono transition-colors"
            >
              <span>View Full Public Profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>

          {/* Quick Security Health Card */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-2.5 shadow-md font-mono text-xs">
            <div className="flex items-center gap-2 text-cyber-text font-bold pb-1 border-b border-cyber-border/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Platform Security Environment</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-cyber-muted">
                <span>Flag Architecture:</span>
                <span className="text-emerald-400 font-bold">Dynamic Per-Player</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Lab Isolation:</span>
                <span className="text-cyan-300">Dedicated Docker Scope</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Scoreboard Policy:</span>
                <span className="text-cyber-text">Anti-Cheat Salted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

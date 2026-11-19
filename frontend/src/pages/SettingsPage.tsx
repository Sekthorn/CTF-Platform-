import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
  Sliders,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Terminal,
  Fingerprint,
  Lock,
  RotateCcw,
  LogOut,
  Trophy,
  Flag,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { ANIME_AVATARS, getAvatarUrl } from '@/data/avatars';

type Tab = 'profile' | 'account' | 'preferences';

interface UiPreferences {
  soundEffects: boolean;
  showHintsWarning: boolean;
  emailNotifications: boolean;
}

interface UserStats {
  totalPoints: number;
  solvedCount: number;
  submissionsCount: number;
  createdAt?: string;
}

const PREFS_STORAGE_KEY = 'websec_ui_preferences';

const DEFAULT_PREFERENCES: UiPreferences = {
  soundEffects: true,
  showHintsWarning: true,
  emailNotifications: false,
};

const loadStoredPreferences = (): UiPreferences => {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UiPreferences>;
    return {
      soundEffects:
        typeof parsed.soundEffects === 'boolean'
          ? parsed.soundEffects
          : DEFAULT_PREFERENCES.soundEffects,
      showHintsWarning:
        typeof parsed.showHintsWarning === 'boolean'
          ? parsed.showHintsWarning
          : DEFAULT_PREFERENCES.showHintsWarning,
      emailNotifications:
        typeof parsed.emailNotifications === 'boolean'
          ? parsed.emailNotifications
          : DEFAULT_PREFERENCES.emailNotifications,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

interface ToggleSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
    <div className="space-y-0.5">
      <label
        htmlFor={id}
        className="font-semibold text-xs text-cyber-text cursor-pointer block"
      >
        {label}
      </label>
      <p className="text-[11px] text-cyber-muted leading-relaxed">
        {description}
      </p>
    </div>

    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        checked
          ? 'bg-emerald-500/80 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
          : 'bg-zinc-900 border-cyber-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-[3px] ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { user, admin, updateUserProfile, isAdmin, logout } = useAuth();
  const currentUser = user || admin;

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [username, setUsername] = useState(currentUser?.username || 'operator');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(
    getAvatarUrl(currentUser?.avatarUrl),
  );
  const [avatarUrl, setAvatarUrl] = useState(
    getAvatarUrl(currentUser?.avatarUrl),
  );
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    solvedCount: 0,
    submissionsCount: 0,
    createdAt: currentUser?.createdAt,
  });

  // Persisted UI preferences
  const [prefs, setPrefs] = useState<UiPreferences>(loadStoredPreferences);
  const [prefsSavedNotice, setPrefsSavedNotice] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username) setUsername(currentUser.username);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.avatarUrl) {
        const resolved = getAvatarUrl(currentUser.avatarUrl);
        setSavedAvatarUrl(resolved);
        setAvatarUrl(resolved);
      }
      if (currentUser.createdAt) {
        setStats((prev) => ({ ...prev, createdAt: currentUser.createdAt }));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    apiClient
      .get('/users/me')
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) {
          if (u.username) setUsername(u.username);
          if (u.email) setEmail(u.email);
          if (u.avatarUrl) {
            const resolved = getAvatarUrl(u.avatarUrl);
            setSavedAvatarUrl(resolved);
            setAvatarUrl(resolved);
          }
          setStats({
            totalPoints: Number(u.totalPoints ?? 0),
            solvedCount: Number(u.solvedCount ?? 0),
            submissionsCount: Number(u._count?.submissions ?? 0),
            createdAt: u.createdAt || currentUser?.createdAt,
          });
        }
      })
      .catch(() => {});
  }, [currentUser?.createdAt]);

  const hasUnsavedAvatar = avatarUrl !== savedAvatarUrl;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSavedSuccess(false);
    try {
      setIsSaving(true);
      await apiClient.patch('/users/me', { avatarUrl });
      updateUserProfile({ avatarUrl });
      setSavedAvatarUrl(avatarUrl);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to save profile avatar. Please try again.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof UiPreferences, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    setPrefsSavedNotice(true);
    setTimeout(() => setPrefsSavedNotice(false), 1800);
  };

  const resetPreferences = () => {
    setPrefs(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify(DEFAULT_PREFERENCES),
      );
    } catch {
      // Ignore storage errors
    }
    setPrefsSavedNotice(true);
    setTimeout(() => setPrefsSavedNotice(false), 1800);
  };

  const currentAvatar =
    ANIME_AVATARS.find((a) => a.url === avatarUrl) || ANIME_AVATARS[0];

  const memberSinceLabel = stats.createdAt
    ? new Date(stats.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Active';

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto font-sans pb-12 animate-fade-in">
      {/* ==================================================================== */}
      {/* 1. HERO HEADER BANNER                                                */}
      {/* ==================================================================== */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/45 via-zinc-900/75 to-cyan-950/40 border border-emerald-500/20 p-6 md:p-7 overflow-hidden backdrop-blur-sm">
        <div
          className="absolute -right-8 -bottom-10 opacity-[0.07] pointer-events-none select-none"
          aria-hidden="true"
        >
          <Settings className="w-60 h-60 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                {isAdmin
                  ? 'Admin Platform Console'
                  : 'Researcher Configuration'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SESSION ACTIVE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-3">
              <Settings className="w-6 h-6 text-emerald-400 shrink-0 hidden sm:block" />
              <span>{isAdmin ? 'Platform Settings' : 'Account Settings'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-cyber-muted leading-relaxed">
              Manage your research identity, cyber persona avatar, security
              architecture overview, and workspace preferences.
            </p>
          </div>

          {/* Right Quick Operator Telemetry */}
          <div className="grid grid-cols-3 bg-zinc-950/75 border border-zinc-800/90 rounded-xl px-4 py-3 shadow-sm shrink-0">
            <div className="text-center pr-4 border-r border-zinc-800">
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                Total XP
              </div>
            </div>
            <div className="text-center px-4 border-r border-zinc-800">
              <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400">
                {stats.solvedCount}
              </div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                Solved Labs
              </div>
            </div>
            <div className="text-center pl-4">
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                {isAdmin ? 'ADMIN' : 'PLAYER'}
              </div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                Clearance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN 2-COLUMN RESPONSIVE LAYOUT                                   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tabs & Settings Controls */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Segmented Pill Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-cyber-card/70 border border-cyber-border rounded-xl p-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Information</span>
              {hasUnsavedAvatar && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-400"
                  title="Unsaved avatar change"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'account'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Account &amp; Security</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>UI Preferences</span>
            </button>
          </div>

          {/* ================================================================ */}
          {/* TAB 1: PROFILE INFORMATION                                       */}
          {/* ================================================================ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 md:p-6 space-y-5 shadow-md">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-cyan-400/20 to-transparent" />

                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyber-border/60">
                  <h2 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Public Researcher Identity</span>
                  </h2>
                  <span className="text-[11px] font-mono text-cyber-muted px-2 py-0.5 rounded bg-cyber-elevated/60 border border-cyber-border/60">
                    Visible on Leaderboards &amp; Solves
                  </span>
                </div>

                {/* Read-only verified identity fields with clean contrast */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-cyber-text font-medium">
                        Username
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyber-muted">
                        <Lock className="w-3 h-3 text-emerald-400/70" />
                        Locked
                      </span>
                    </div>
                    <div className="h-10 px-3 rounded-lg bg-zinc-950/60 border border-cyber-border/90 flex items-center justify-between font-mono text-xs text-slate-200">
                      <span className="truncate">{username}</span>
                      <span className="text-[10px] text-emerald-400/80 uppercase">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10.5px] text-cyber-muted">
                      Usernames are uniquely assigned during registration.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-cyber-text font-medium">
                        Email Address
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyber-muted">
                        <Lock className="w-3 h-3 text-sky-400/70" />
                        Protected
                      </span>
                    </div>
                    <div className="h-10 px-3 rounded-lg bg-zinc-950/60 border border-cyber-border/90 flex items-center justify-between font-mono text-xs text-slate-200">
                      <span className="truncate">{email || '—'}</span>
                      <span className="text-[10px] text-sky-400/80 uppercase">
                        Primary
                      </span>
                    </div>
                    <p className="text-[10.5px] text-cyber-muted">
                      Associated with authenticated security credentials.
                    </p>
                  </div>
                </div>

                {/* Anime Avatar Picker */}
                <div className="pt-2 border-t border-cyber-border/50">
                  <AvatarPicker
                    value={avatarUrl}
                    onChange={(newUrl) => {
                      setAvatarUrl(newUrl);
                      setSavedSuccess(false);
                      setSaveError(null);
                    }}
                    isSaving={isSaving}
                  />
                </div>

                {/* Error Feedback */}
                {saveError && (
                  <div className="p-3 rounded-lg bg-red-950/25 border border-red-500/35 text-xs font-mono text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Submit Toolbar */}
                <div className="pt-4 border-t border-cyber-border/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSaving || !hasUnsavedAvatar}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs h-9 px-4 font-mono font-semibold shadow-md shadow-emerald-950/40"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSaving ? 'Saving...' : 'Save Avatar & Profile'}
                    </Button>

                    {hasUnsavedAvatar && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(savedAvatarUrl)}
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-mono text-cyber-muted hover:text-cyber-text bg-cyber-elevated/60 hover:bg-cyber-elevated border border-cyber-border transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revert</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    {hasUnsavedAvatar && !savedSuccess && (
                      <span className="text-amber-300 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px]">
                        Preview active — click Save to apply
                      </span>
                    )}
                    {savedSuccess && (
                      <span className="text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Changes saved successfully
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 2: ACCOUNT & SECURITY                                        */}
          {/* ================================================================ */}
          {activeTab === 'account' && (
            <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 md:p-6 space-y-5 shadow-md">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-500/60 via-emerald-400/20 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyber-border/60">
                <h2 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Security &amp; Authentication Architecture</span>
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                  JWT / RBAC Active
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cyber-elevated/55 border border-cyber-border space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-cyber-text">
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Platform Security Protocol</span>
                </div>
                <p className="text-cyber-muted leading-relaxed">
                  Your session is protected via signed JSON Web Tokens (JWT),
                  HttpOnly cookie transport, and database-backed refresh token
                  rotation. Credentials use salted password hashing with strict
                  server-side role authorization guards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">
                    Account Role
                  </span>
                  <p className="font-bold text-emerald-400">
                    {isAdmin ? 'ROOT ADMINISTRATOR' : 'SECURITY RESEARCHER'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">
                    Session Transport
                  </span>
                  <p className="font-bold text-cyan-300">
                    JWT Bearer + Cookie
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-cyber-border bg-cyber-elevated/40 space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">
                    Refresh Window
                  </span>
                  <p className="font-bold text-cyber-text">7 Days Rotation</p>
                </div>
              </div>

              {isAdmin && (
                <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
                      <Fingerprint className="w-4 h-4 text-purple-400" />
                      <span>Administrative Security Controls</span>
                    </div>
                    <p className="text-[11px] text-cyber-muted">
                      Manage administrator invitations, RBAC role assignments,
                      and platform audit logs.
                    </p>
                  </div>

                  <Link
                    to="/admin/management"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 transition-colors shrink-0 w-fit"
                  >
                    <span>Admin Management</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-cyber-border/60 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-cyber-muted">
                  Need to end your active session on this browser?
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: UI PREFERENCES                                            */}
          {/* ================================================================ */}
          {activeTab === 'preferences' && (
            <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 md:p-6 space-y-4 shadow-md">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-emerald-400/20 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyber-border/60">
                <h2 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Workspace &amp; Audio Preferences</span>
                </h2>
                <div className="flex items-center gap-2">
                  {prefsSavedNotice && (
                    <span className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-cyber-muted px-2 py-0.5 rounded bg-cyber-elevated/60 border border-cyber-border/60">
                    Saved Locally
                  </span>
                </div>
              </div>

              <div className="divide-y divide-cyber-border/60">
                <ToggleSwitch
                  id="pref-sound-effects"
                  label="Audio Feedback & Sound Effects"
                  description="Play acoustic confirmation chimes upon capturing flags and submitting solutions."
                  checked={prefs.soundEffects}
                  onChange={(val) => updatePreference('soundEffects', val)}
                />

                <ToggleSwitch
                  id="pref-hints-warning"
                  label="Hint Cost Confirmation"
                  description="Require an explicit confirmation dialog before unlocking hint penalty points in the lab."
                  checked={prefs.showHintsWarning}
                  onChange={(val) => updatePreference('showHintsWarning', val)}
                />

                <ToggleSwitch
                  id="pref-updates-feed"
                  label="Platform Updates Feed"
                  description="Surface live notification alerts when new vulnerability scenarios and learning modules are released."
                  checked={prefs.emailNotifications}
                  onChange={(val) => updatePreference('emailNotifications', val)}
                />
              </div>

              <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyber-muted">
                  Preferences persist automatically in your browser.
                </span>
                <button
                  type="button"
                  onClick={resetPreferences}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyber-muted hover:text-cyber-text bg-cyber-elevated/60 hover:bg-cyber-elevated border border-cyber-border transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: LIVE ARENA DOSSIER & SECURITY ENVIRONMENT            */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Live Persona ID Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-cyber-card to-cyber-card p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-6 -mr-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-cyber-border/50 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Arena Dossier
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  hasUnsavedAvatar
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                }`}
              >
                {hasUnsavedAvatar ? 'PREVIEWING' : 'ACTIVE IDENTITY'}
              </span>
            </div>

            {/* Avatar & Persona Details */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.35)] overflow-hidden bg-cyber-bg transition-transform hover:scale-105">
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
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
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

              {/* Persona Skill Tags */}
              {currentAvatar.tags?.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                  {currentAvatar.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated/80 text-slate-300 border border-cyber-border/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Operator Stats Strip */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 p-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>{stats.totalPoints}</span>
                </div>
                <div className="text-[9px] text-cyber-muted uppercase mt-0.5">
                  Points
                </div>
              </div>
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 p-2">
                <div className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-1">
                  <Flag className="w-3 h-3" />
                  <span>{stats.solvedCount}</span>
                </div>
                <div className="text-[9px] text-cyber-muted uppercase mt-0.5">
                  Solves
                </div>
              </div>
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 p-2">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>{stats.submissionsCount}</span>
                </div>
                <div className="text-[9px] text-cyber-muted uppercase mt-0.5">
                  Attempts
                </div>
              </div>
            </div>

            {/* Quick Dossier Matrix */}
            <div className="rounded-lg border border-cyber-border/70 bg-cyber-elevated/40 p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">
                  Clearance:
                </span>
                <span className="text-cyan-300 font-medium">
                  {isAdmin ? 'Master Security Admin' : 'Security Researcher'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">
                  Target Status:
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Arena Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted text-[11px]">
                  Member Since:
                </span>
                <span className="text-cyber-text text-[11px]">
                  {memberSinceLabel}
                </span>
              </div>
            </div>

            {/* Action Links */}
            <div className="space-y-2">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-cyber-border bg-cyber-elevated/80 hover:bg-cyber-elevated text-cyber-text text-xs font-mono transition-colors"
              >
                <span>View Full Public Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/knowledge"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-xs font-mono transition-colors"
                >
                  <span>Open Knowledge Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Security Health Card */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-2.5 shadow-md font-mono text-xs">
            <div className="flex items-center gap-2 text-cyber-text font-bold pb-1.5 border-b border-cyber-border/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Platform Security Environment</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-cyber-muted">
                <span>Flag Architecture:</span>
                <span className="text-emerald-400 font-bold">
                  Dynamic Per-Player
                </span>
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';
import { AvatarSelectorModal } from '@/components/profile/AvatarSelectorModal';
import { getAvatarUrl, ANIME_AVATARS } from '@/data/avatars';

export const ProfilePage: React.FC = () => {
  const { user, admin, updateUserProfile, isAdmin } = useAuth();
  const currentUser = user || admin;

  const [username, setUsername] = useState(currentUser?.username || 'Researcher');
  const [email, setEmail] = useState(currentUser?.email || 'researcher@websec.ctf');
  const [avatarUrl, setAvatarUrl] = useState(
    getAvatarUrl(currentUser?.avatarUrl)
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(63);
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username) setUsername(currentUser.username);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.avatarUrl) setAvatarUrl(getAvatarUrl(currentUser.avatarUrl));
    }
  }, [currentUser]);

  // Fetch live user info & challenges
  useEffect(() => {
    // 1. Fetch live profile stats
    apiClient
      .get('/users/me')
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) {
          if (u.username) setUsername(u.username);
          if (u.email) setEmail(u.email);
          if (u.avatarUrl) setAvatarUrl(getAvatarUrl(u.avatarUrl));
          if (typeof u.totalPoints === 'number') setTotalPoints(u.totalPoints);
        }
      })
      .catch(() => {});

    // 2. Fetch live challenges to compute real user solved list
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.items;
        if (Array.isArray(items)) {
          setTotalChallenges(items.length);
          const userSolved = items
            .filter(
              (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved
            )
            .map((c: any) => ({
              ...c,
              categoryName:
                typeof c.category === 'object' && c.category !== null
                  ? c.category.name
                  : (c.category || 'Web Security'),
            }));
          setSolvedChallenges(userSolved);
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarSelect = async (newUrl: string) => {
    try {
      setIsSaving(true);
      setAvatarUrl(newUrl);
      await apiClient.patch('/users/me', { avatarUrl: newUrl });
      updateUserProfile({ avatarUrl: newUrl });
      setSavedSuccess(true);
      setIsModalOpen(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentPersona =
    ANIME_AVATARS.find((a) => a.url === avatarUrl) || ANIME_AVATARS[0];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Profile Header Card */}
      <div className="rounded-xl border border-cyber-border bg-cyber-card p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <UserAvatar
                src={avatarUrl}
                alt={username}
                size="xl"
                role={currentUser?.role}
                showGlow={true}
                onClick={() => setIsModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-cyber-elevated border border-cyber-border text-emerald-400 hover:text-white transition-colors shadow-md"
                title="Change Anime Avatar"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-cyber-text">{username}</h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                }`}>
                  {isAdmin ? 'SECURITY ADMIN' : 'STUDENT RESEARCHER'}
                </span>
              </div>
              <p className="text-xs text-cyber-muted font-mono">{email}</p>
              <div className="flex items-center gap-3 text-xs font-mono pt-1 text-cyber-muted">
                <span>Points: <strong className="text-emerald-400">{totalPoints} PTS</strong></span>
                <span>•</span>
                <span>Solved: <strong className="text-emerald-400">{solvedChallenges.length} / {totalChallenges}</strong></span>
                <span>•</span>
                <span>Persona: <strong className="text-slate-300">{currentPersona.name}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-cyber-border">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs h-8 gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Change Avatar</span>
              </Button>
              <Link to="/settings">
                <Button size="sm" variant="outline" className="border-cyber-border bg-cyber-elevated text-xs h-8 font-mono">
                  Settings
                </Button>
              </Link>
            </div>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Avatar synchronized
              </span>
            )}
          </div>
        </div>

        {/* Modal for selecting avatar */}
        <AvatarSelectorModal
          isOpen={isModalOpen}
          currentAvatar={avatarUrl}
          onSelect={handleAvatarSelect}
          onClose={() => setIsModalOpen(false)}
          isSaving={isSaving}
        />
      </div>

      {/* 2. Stats Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Solved Challenges</span>
          <div className="text-2xl font-bold font-mono text-cyber-text">
            {solvedChallenges.length} <span className="text-xs text-cyber-muted font-normal">/ {totalChallenges}</span>
          </div>
          <p className="text-xs text-emerald-400 font-mono">
            {totalChallenges > 0 ? Math.round((solvedChallenges.length / totalChallenges) * 100) : 0}% total completion
          </p>
        </div>

        <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Total Points</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalPoints} <span className="text-xs text-cyber-muted font-normal">PTS</span>
          </div>
          <p className="text-xs text-cyber-muted font-mono">Verified Score</p>
        </div>

        <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Security Domains</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            11 <span className="text-xs text-cyber-muted font-normal">Categories</span>
          </div>
          <p className="text-xs text-cyber-muted font-mono">
            63 Knowledge Lessons
          </p>
        </div>
      </div>

      {/* 3. Solved Challenges List */}
      <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
          <h2 className="text-sm font-bold text-cyber-text flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Solved Challenges ({solvedChallenges.length})
          </h2>
          <Link to="/challenges" className="text-xs font-mono text-emerald-400 hover:underline">
            Browse More
          </Link>
        </div>

        {solvedChallenges.length === 0 ? (
          <div className="py-8 text-center text-cyber-muted font-mono text-xs">
            No challenges solved yet. Jump into an active challenge in the arena to capture flags and earn points!
          </div>
        ) : (
          <div className="divide-y divide-cyber-border/60">
            {solvedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/challenges/${challenge.slug}`}
                      className="font-bold text-cyber-text hover:text-emerald-400 transition-colors"
                    >
                      {challenge.title}
                    </Link>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </div>
                  <p className="text-cyber-muted text-[11px]">
                    {challenge.categoryName || (typeof challenge.category === 'object' && challenge.category !== null ? challenge.category.name : challenge.category) || 'Web Security'} · {challenge.owaspReference || 'OWASP'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 font-mono">
                  <span className="text-emerald-400 font-bold">+{challenge.points} PTS</span>
                  <Link to={`/challenges/${challenge.slug}`}>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-cyber-border bg-cyber-elevated text-cyber-text">
                      Review Lab
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Search,
  Crown,
  Award,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/api';
import { LeaderboardUser } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/data/avatars';
import { UserAvatar } from '@/components/common/UserAvatar';

export const LeaderboardPage: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState<number>(1);
  const [search, setSearch] = useState('');
  const deferredSearch = React.useDeferredValue(search);

  // Fetch live from backend API
  const fetchLeaderboard = useCallback((showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    else setLoading(true);

    apiClient
      .get('/leaderboard', { params: { limit: 100 } })
      .then((res) => {
        const payload = res.data?.data || res.data;
        if (payload?.items && Array.isArray(payload.items)) {
          const apiUsers: LeaderboardUser[] = payload.items.map((item: any, index: number) => ({
            rank: item.rank || index + 1,
            id: item.id,
            username: item.username,
            handle: `@${item.username}`,
            avatar: getAvatarUrl(item.avatarUrl),
            country: 'Global',
            points: item.totalPoints,
            solvedCount: item.solvedChallengesCount || 0,
            streakDays: 5,
            badge: item.role === 'ADMIN' ? 'Root Administrator' : 'Security Researcher',
          }));
          setUsers(apiUsers);
          setIsAdminView(Boolean(payload.isAdminView));
          setTotalParticipants(payload.totalParticipants || apiUsers.length);
        } else {
          setUsers([]);
          setTotalParticipants(0);
        }
      })
      .catch(() => {
        // Fallback for current player
        if (user) {
          setUsers([
            {
              rank: 1,
              id: user.id,
              username: user.username,
              handle: `@${user.username}`,
              avatar: getAvatarUrl(user.avatarUrl),
              country: 'Global',
              points: 0,
              solvedCount: 0,
              streakDays: 1,
              badge: isAdmin ? 'Root Administrator' : 'Security Researcher',
            },
          ]);
          setTotalParticipants(1);
        } else {
          setUsers([]);
          setTotalParticipants(0);
        }
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  }, [user, isAdmin]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Loading Skeleton State
  if (authLoading || loading) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between pb-1">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-cyber-elevated rounded animate-pulse" />
            <div className="h-4 w-72 bg-cyber-elevated/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-48 rounded-xl border border-cyber-border bg-cyber-card animate-pulse" />
        <div className="h-64 rounded-xl border border-cyber-border bg-cyber-card animate-pulse" />
      </div>
    );
  }

  // ==========================================
  // VIEW A: ADMIN MASTER VIEW (Shows All Users for Admin)
  // ==========================================
  if (isAdmin || isAdminView) {
    const filteredUsers = users.filter(
      (u) =>
        !deferredSearch ||
        u.username.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        u.handle.toLowerCase().includes(deferredSearch.toLowerCase())
    );
    const top3 = users.slice(0, 3);
    const currentUsername = user?.username || '';

    return (
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Global Leaderboard
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                ADMIN MASTER VIEW ({totalParticipants} Participants)
              </span>
            </div>
            <p className="text-xs md:text-sm text-cyber-muted mt-0.5">
              Full administrative scoreboard across all platform participants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-cyber-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search researcher..."
                className="pl-8 text-xs h-9 bg-cyber-card border-cyber-border text-cyber-text placeholder:text-cyber-muted/60"
              />
            </div>
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={isRefreshing}
              title="Refresh Leaderboard"
              className="p-2 rounded-lg border border-cyber-border bg-cyber-card hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-text transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Podium for Admin */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {top3[1] && (
              <div className="rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/20 via-cyber-card to-cyber-card p-5 flex flex-col items-center text-center space-y-3 relative order-2 md:order-1 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold font-mono flex items-center justify-center text-xs border border-slate-600">
                  #2
                </div>
                <UserAvatar src={top3[1]?.avatar} alt={top3[1]?.username} size="lg" />
                <div>
                  <h3 className="font-bold text-cyber-text text-sm">{top3[1]?.username}</h3>
                  <p className="text-xs text-cyber-muted font-mono">{top3[1]?.handle}</p>
                </div>
                <div className="text-emerald-400 font-mono font-bold text-base">
                  {top3[1]?.points} <span className="text-xs text-cyber-muted font-normal">PTS</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated text-cyber-muted">
                  {top3[1]?.solvedCount} Solves
                </span>
              </div>
            )}

            {top3[0] && (
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-cyber-card to-cyber-card p-6 flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 shadow-xl shadow-amber-950/20">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono flex items-center justify-center text-sm border border-amber-500/50">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <UserAvatar src={top3[0]?.avatar} alt={top3[0]?.username} size="xl" showGlow={true} />
                <div>
                  <h3 className="font-extrabold text-cyber-text text-base">{top3[0]?.username}</h3>
                  <p className="text-xs text-amber-400/90 font-mono">{top3[0]?.handle}</p>
                </div>
                <div className="text-amber-400 font-mono font-extrabold text-xl">
                  {top3[0]?.points} <span className="text-xs text-cyber-muted font-normal">PTS</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  {top3[0]?.solvedCount} Solves
                </span>
              </div>
            )}

            {top3[2] && (
              <div className="rounded-xl border border-amber-900/40 bg-gradient-to-b from-amber-950/20 via-cyber-card to-cyber-card p-5 flex flex-col items-center text-center space-y-3 relative order-3 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-amber-900/40 text-amber-400 font-bold font-mono flex items-center justify-center text-xs border border-amber-800/60">
                  #3
                </div>
                <UserAvatar src={top3[2]?.avatar} alt={top3[2]?.username} size="lg" />
                <div>
                  <h3 className="font-bold text-cyber-text text-sm">{top3[2]?.username}</h3>
                  <p className="text-xs text-cyber-muted font-mono">{top3[2]?.handle}</p>
                </div>
                <div className="text-emerald-400 font-mono font-bold text-base">
                  {top3[2]?.points} <span className="text-xs text-cyber-muted font-normal">PTS</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated text-cyber-muted">
                  {top3[2]?.solvedCount} Solves
                </span>
              </div>
            )}
          </div>
        )}

        {/* Scoreboard Table for Admin */}
        <div className="rounded-xl border border-cyber-border bg-cyber-card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-cyber-elevated border-b border-cyber-border text-cyber-muted uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Researcher</th>
                  <th className="py-3 px-4 text-center">Role</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {filteredUsers.map((item) => {
                  const isCurrentUser =
                    item.id === user?.id ||
                    item.username.toLowerCase() === currentUsername.toLowerCase();
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-emerald-950/25 hover:bg-emerald-950/40 border-l-2 border-l-emerald-500'
                          : 'hover:bg-cyber-elevated/40'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {item.rank === 1 ? (
                          <span className="text-amber-400 inline-flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 inline text-amber-400" />
                            #1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="text-slate-300">#2</span>
                        ) : item.rank === 3 ? (
                          <span className="text-amber-600">#3</span>
                        ) : (
                          <span className="text-cyber-muted">#{item.rank}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar src={item.avatar} alt={item.username} size="sm" />
                          <div>
                            <div className="font-semibold text-cyber-text flex items-center gap-1.5">
                              {item.username}
                              {isCurrentUser && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-cyber-muted">{item.handle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          item.badge === 'Root Administrator'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                            : 'bg-cyber-elevated text-cyber-muted border-cyber-border/40'
                        }`}>
                          {item.badge}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-cyber-muted">
                        {item.solvedCount}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {item.points} <span className="text-[10px] font-normal text-cyber-muted">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW B: REGULAR PLAYER VIEW (Shows ONLY Player's Own Data, No Rank)
  // ==========================================
  const myRecord = users[0] || {
    id: user?.id || 'me',
    username: user?.username || 'player',
    handle: `@${user?.username || 'player'}`,
    avatar: getAvatarUrl(user?.avatarUrl),
    points: 0,
    solvedCount: 0,
    badge: 'Security Researcher',
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Player Scoreboard & Standing
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE PLAYER
            </span>
          </div>
          <p className="text-xs md:text-sm text-cyber-muted mt-1">
            Your live challenge bounty points and verified flag captures.
          </p>
        </div>

        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={isRefreshing}
          title="Refresh Scoreboard"
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyber-border bg-cyber-card hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-text text-xs font-mono transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Featured Player Personal Card (NO RANK) */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-cyber-card to-cyber-card p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <UserAvatar
            src={myRecord.avatar}
            alt={myRecord.username}
            size="xl"
            showGlow={true}
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg md:text-xl font-bold text-cyber-text tracking-wide">
                {myRecord.username}
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                YOU
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                Security Researcher
              </span>
            </div>
            <p className="text-xs text-cyber-muted font-mono">{myRecord.handle}</p>

            {/* Metrics Grid (NO RANK) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 max-w-md">
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/60 p-3.5 text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-cyber-muted tracking-wider block">
                  Bounty Points
                </span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {myRecord.points} <span className="text-xs font-normal text-cyber-muted">PTS</span>
                </p>
              </div>

              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/60 p-3.5 text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-cyber-muted tracking-wider block">
                  Solved Challenges
                </span>
                <p className="text-xl font-bold font-mono text-cyan-300 mt-1">
                  {myRecord.solvedCount} <span className="text-xs font-normal text-cyber-muted">Solves</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard Table (Showing ONLY Player, NO RANK COLUMN) */}
      <div className="rounded-xl border border-cyber-border bg-cyber-card overflow-hidden shadow-lg">
        <div className="p-4 border-b border-cyber-border/60 bg-cyber-elevated/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-xs text-cyber-text uppercase tracking-wider font-mono">
              Scoreboard Standing
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyber-muted">
            1 Researcher Record Visible
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-cyber-elevated border-b border-cyber-border text-cyber-muted uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Researcher</th>
                <th className="py-3 px-4 text-center">Role</th>
                <th className="py-3 px-4 text-center">Solved Challenges</th>
                <th className="py-3 px-4 text-right">Bounty Points</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-emerald-950/25 border-l-2 border-l-emerald-500">
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-3">
                    <UserAvatar src={myRecord.avatar} alt={myRecord.username} size="sm" />
                    <div>
                      <div className="font-semibold text-cyber-text flex items-center gap-1.5">
                        {myRecord.username}
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                          YOU
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyber-muted">{myRecord.handle}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-cyber-elevated text-cyber-muted border-cyber-border/40">
                    Security Researcher
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center font-mono text-cyber-muted font-medium">
                  {myRecord.solvedCount}
                </td>

                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                  {myRecord.points} <span className="text-[10px] font-normal text-cyber-muted">PTS</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

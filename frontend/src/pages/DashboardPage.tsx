import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  ChevronRight,
  Target,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/StatCard';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { mockChallenges } from '@/data/mock/challenges';
import { mockLearningPaths } from '@/data/mock/learningPaths';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/api';

export const DashboardPage: React.FC = () => {
  const { user, admin } = useAuth();
  const currentUser = user || admin;

  const [stats, setStats] = useState({
    challengesCompleted: 0,
    totalChallenges: 63,
    totalPoints: 0,
  });

  const [recommendedChallenges, setRecommendedChallenges] = useState<any[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch live user stats
    apiClient
      .get('/users/me')
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) {
          setStats((prev) => ({
            ...prev,
            challengesCompleted: u.solvedCount || 0,
            totalPoints: u.totalPoints || 0,
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch live challenges to compute real user progress
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.items;
        if (Array.isArray(items) && items.length > 0) {
          setStats((prev) => ({ ...prev, totalChallenges: items.length }));
          const solved = items.filter(
            (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved
          );
          const unsolved = items.filter(
            (c: any) => c.userProgress?.status !== 'SOLVED' && !c.isSolved
          );
          setSolvedChallenges(solved.slice(0, 5));
          setRecommendedChallenges(unsolved.slice(0, 3));
        } else {
          const solved = mockChallenges.filter((c) => c.solved);
          const unsolved = mockChallenges.filter((c) => !c.solved);
          setSolvedChallenges(solved.slice(0, 5));
          setRecommendedChallenges(unsolved.slice(0, 3));
        }
      })
      .catch(() => {
        const solved = mockChallenges.filter((c) => c.solved);
        const unsolved = mockChallenges.filter((c) => !c.solved);
        setSolvedChallenges(solved.slice(0, 5));
        setRecommendedChallenges(unsolved.slice(0, 3));
      });

    // 3. Leaderboard participant count
    apiClient
      .get('/leaderboard')
      .then((res) => {
        const payload = res.data?.data || res.data;
        const total = payload?.pagination?.total || payload?.items?.length || 1;
        setStats((prev) => ({ ...prev, totalUsers: total }));
      })
      .catch(() => {});
  }, []);

  const activePath = mockLearningPaths[0]; // Active roadmap
  const completionPercentage =
    stats.totalChallenges > 0
      ? Math.round((stats.challengesCompleted / stats.totalChallenges) * 100)
      : 0;

  // OWASP category metrics based on real solves
  const injectionCount = solvedChallenges.filter((c) =>
    (c.owaspReference || c.category?.name || c.category || '').toLowerCase().includes('injection')
  ).length;
  const accessCount = solvedChallenges.filter((c) =>
    (c.owaspReference || c.category?.name || c.category || '').toLowerCase().includes('access')
  ).length;
  const authCount = solvedChallenges.filter((c) =>
    (c.owaspReference || c.category?.name || c.category || '').toLowerCase().includes('auth')
  ).length;
  const configCount = solvedChallenges.filter((c) =>
    (c.owaspReference || c.category?.name || c.category || '').toLowerCase().includes('misconfiguration')
  ).length;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyber-card via-cyber-card to-cyber-elevated border border-cyber-border p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Exploitation Arena Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-cyber-text tracking-tight">
              Welcome back, <span className="text-emerald-400 font-mono">{currentUser?.username || 'Researcher'}</span>
            </h1>
            <p className="text-xs md:text-sm text-cyber-muted leading-relaxed">
              Target environment ready. You have completed{' '}
              <strong className="text-cyber-text font-mono">{stats.challengesCompleted}</strong> of{' '}
              <span className="text-cyber-muted font-mono">{stats.totalChallenges}</span> challenges, accumulating{' '}
              <strong className="text-emerald-400 font-mono">{stats.totalPoints}</strong> points.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/challenges">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 px-4 shadow-lg shadow-emerald-950/40">
                <Target className="mr-2 h-4 w-4" />
                Browse Challenges
              </Button>
            </Link>
            <Link to="/learning-paths">
              <Button variant="outline" className="border-cyber-border bg-cyber-elevated/60 hover:bg-cyber-elevated text-xs h-9 px-4 text-cyber-text">
                <Compass className="mr-2 h-4 w-4 text-emerald-400" />
                Learning Paths
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Challenges Solved"
          value={stats.challengesCompleted}
          subValue={`/ ${stats.totalChallenges}`}
          icon={Flag}
          trend={`${completionPercentage}% Completion Rate`}
          accentColor="green"
        />
        <StatCard
          label="Total Points"
          value={stats.totalPoints}
          subValue="PTS"
          icon={Zap}
          trend="Real-time Verified"
          accentColor="cyan"
        />
        <StatCard
          label="Security Domains"
          value="11"
          subValue="Categories"
          icon={Shield}
          trend="OWASP & WSTG Aligned"
          accentColor="purple"
        />
        <StatCard
          label="Curriculum Progress"
          value={`${completionPercentage}%`}
          subValue="Coverage"
          icon={BookOpen}
          trend={`${stats.challengesCompleted} Solved`}
          accentColor="cyan"
        />
      </div>

      {/* 3. Learning Path Tracker & Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Learning Path */}
        <div className="lg:col-span-2 rounded-xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyber-muted">
                  Curriculum Roadmap
                </h3>
              </div>
              <DifficultyBadge difficulty={activePath.difficulty} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-cyber-text tracking-tight">
                {activePath.title}
              </h2>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed line-clamp-2">
                {activePath.description}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyber-muted">Completion</span>
                <span className="text-emerald-400 font-bold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-cyber-elevated" />
            </div>

            {/* Key topics badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {activePath.topics.map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated border border-cyber-border text-cyber-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
              <Clock className="w-3.5 h-3.5 text-cyber-muted" />
              <span>Target: Full Curriculum Mastery</span>
            </div>
            <Link to="/learning-paths">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
                Explore Paths
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* OWASP & Security Skill Coverage */}
        <div className="rounded-xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-cyber-text tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              OWASP Top 10 Mastery
            </h3>
            <p className="text-[11px] text-cyber-muted mt-1">
              Proficiency across core vulnerability classes.
            </p>

            <div className="space-y-3 mt-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-cyber-muted text-[11px]">
                  <span>A03: Injection</span>
                  <span className="text-emerald-400">{injectionCount > 0 ? `${injectionCount * 10}%` : '0%'}</span>
                </div>
                <Progress value={Math.min(injectionCount * 10, 100)} className="h-1.5 bg-cyber-elevated" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-cyber-muted text-[11px]">
                  <span>A01: Broken Access Control</span>
                  <span className="text-emerald-400">{accessCount > 0 ? `${accessCount * 10}%` : '0%'}</span>
                </div>
                <Progress value={Math.min(accessCount * 10, 100)} className="h-1.5 bg-cyber-elevated" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-cyber-muted text-[11px]">
                  <span>A07: Identification & Auth</span>
                  <span className="text-amber-400">{authCount > 0 ? `${authCount * 10}%` : '0%'}</span>
                </div>
                <Progress value={Math.min(authCount * 10, 100)} className="h-1.5 bg-cyber-elevated" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-cyber-muted text-[11px]">
                  <span>A05: Security Misconfiguration</span>
                  <span className="text-slate-500">{configCount > 0 ? `${configCount * 10}%` : '0%'}</span>
                </div>
                <Progress value={Math.min(configCount * 10, 100)} className="h-1.5 bg-cyber-elevated" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cyber-border">
            <Link
              to="/challenges"
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center justify-between"
            >
              <span>Explore Unsolved Vulnerabilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recommended Next Challenges & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Challenges */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-cyber-text">
                Recommended Challenges
              </h3>
            </div>
            <Link
              to="/challenges"
              className="text-xs text-cyber-muted hover:text-emerald-400 font-mono transition-colors flex items-center"
            >
              View All ({stats.totalChallenges})
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-xl border border-cyber-border bg-cyber-card p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyber-muted line-clamp-1">
                      {challenge.category?.name || challenge.category}
                    </span>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </div>

                  <h4 className="text-xs font-bold text-cyber-text group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {challenge.title}
                  </h4>

                  <p className="text-[11px] text-cyber-muted line-clamp-2">
                    {challenge.shortDescription || challenge.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-cyber-border flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{challenge.points} <span className="text-[10px] font-normal text-cyber-muted">PTS</span>
                  </span>
                  <Link to={`/challenges/${challenge.slug}`}>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5 border-cyber-border bg-cyber-elevated/40 hover:bg-cyber-elevated text-cyber-text">
                      Enter Lab
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Solves & Platform Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-cyber-text">
              Recent Completions ({solvedChallenges.length})
            </h3>
          </div>

          {solvedChallenges.length === 0 ? (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-6 text-center text-xs text-cyber-muted font-mono space-y-2">
              <p>No challenges solved yet.</p>
              <p className="text-[11px] text-zinc-500">
                Select an entry challenge to earn points and unlock your activity feed!
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-3 divide-y divide-cyber-border/60">
              {solvedChallenges.map((c) => (
                <div key={c.id} className="pt-3 first:pt-0 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <Link
                        to={`/challenges/${c.slug}`}
                        className="text-xs font-semibold text-cyber-text hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <span className="text-[10px] text-cyber-muted font-mono block">
                      {c.owaspReference || 'OWASP'} · {c.category?.name || c.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                    +{c.points} pts
                  </span>
                </div>
              ))}

              <div className="pt-3">
                <Link
                  to="/profile"
                  className="text-xs font-mono text-cyber-muted hover:text-cyber-text text-center block w-full py-1"
                >
                  View full solve timeline →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

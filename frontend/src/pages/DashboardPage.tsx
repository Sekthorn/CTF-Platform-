import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  ChevronRight,
  Target,
  Compass,
  Settings,
  Users,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/StatCard';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { mockChallenges } from '@/data/mock/challenges';
import { mockLearningPaths } from '@/data/mock/learningPaths';
import { getAvatarUrl } from '@/data/avatars';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/api';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeProgress } from '@/types';

interface CachedDashboardData {
  stats: {
    challengesCompleted: number;
    totalChallenges: number;
    totalPoints: number;
    domainCount: number;
  };
  allChallenges: any[];
  recommendedChallenges: any[];
  solvedChallenges: any[];
  knowledgeProgress: KnowledgeProgress | null;
  timestamp: number;
}

// Lightweight memory cache to avoid redundant API refetches on route transitions
let dashboardCache: CachedDashboardData | null = null;
const CACHE_TTL_MS = 30000;

const getCategoryName = (challenge: any): string => {
  if (typeof challenge?.category === 'object' && challenge.category !== null) {
    return challenge.category.name || challenge.category.slug || 'Web Security';
  }
  return challenge?.category || 'Web Security';
};

export const DashboardPage: React.FC = () => {
  const { user, admin, isAdmin } = useAuth();
  const currentUser = user || admin;

  const isCacheFresh =
    dashboardCache !== null &&
    Date.now() - dashboardCache.timestamp < CACHE_TTL_MS;

  const [stats, setStats] = useState(() =>
    isCacheFresh && dashboardCache
      ? dashboardCache.stats
      : {
          challengesCompleted: 0,
          totalChallenges: 73,
          totalPoints: 0,
          domainCount: mockLearningPaths.length,
        },
  );

  const [allChallenges, setAllChallenges] = useState<any[]>(() =>
    isCacheFresh && dashboardCache ? dashboardCache.allChallenges : [],
  );
  const [recommendedChallenges, setRecommendedChallenges] = useState<any[]>(
    () =>
      isCacheFresh && dashboardCache
        ? dashboardCache.recommendedChallenges
        : [],
  );
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>(() =>
    isCacheFresh && dashboardCache ? dashboardCache.solvedChallenges : [],
  );
  const [knowledgeProgress, setKnowledgeProgress] =
    useState<KnowledgeProgress | null>(() =>
      isCacheFresh && dashboardCache ? dashboardCache.knowledgeProgress : null,
    );

  useEffect(() => {
    if (
      dashboardCache &&
      Date.now() - dashboardCache.timestamp < CACHE_TTL_MS
    ) {
      return;
    }

    let mounted = true;

    Promise.allSettled([
      apiClient.get('/users/me'),
      apiClient.get('/challenges', { params: { limit: 100 } }),
      knowledgeService.getProgress(),
    ]).then(([userRes, challengesRes, knowledgeRes]) => {
      if (!mounted) return;

      let challengesCompleted = 0;
      let totalPoints = 0;
      if (userRes.status === 'fulfilled') {
        const u = userRes.value.data?.data || userRes.value.data;
        if (u) {
          challengesCompleted = u.solvedCount || 0;
          totalPoints = u.totalPoints || 0;
        }
      }

      let items: any[] = [];
      if (challengesRes.status === 'fulfilled') {
        const fetched =
          challengesRes.value.data?.data?.items ||
          challengesRes.value.data?.items;
        if (Array.isArray(fetched) && fetched.length > 0) {
          items = fetched;
        }
      }

      if (items.length === 0) {
        items = mockChallenges;
      }

      const solved = items.filter(
        (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved || c.solved,
      );
      const unsolved = items.filter(
        (c: any) =>
          c.userProgress?.status !== 'SOLVED' && !c.isSolved && !c.solved,
      );

      // Prioritize beginner / Foundations starter labs in recommendations
      const difficultyRank: Record<string, number> = {
        BEGINNER: 0,
        EASY: 1,
        MEDIUM: 2,
        HARD: 3,
      };
      const sortedRecommended = [...unsolved]
        .sort((a, b) => {
          const dA =
            difficultyRank[String(a.difficulty || '').toUpperCase()] ?? 9;
          const dB =
            difficultyRank[String(b.difficulty || '').toUpperCase()] ?? 9;
          return dA - dB;
        })
        .slice(0, 3);

      const uniqueCategories = new Set(
        items.map((c: any) => getCategoryName(c).toLowerCase()),
      );
      const domainCount = Math.max(
        uniqueCategories.size,
        mockLearningPaths.length,
      );

      const nextKnowledge =
        knowledgeRes.status === 'fulfilled' ? knowledgeRes.value : null;

      const nextStats = {
        challengesCompleted:
          userRes.status === 'fulfilled' ? challengesCompleted : solved.length,
        totalChallenges: items.length,
        totalPoints,
        domainCount,
      };

      const topSolved = solved.slice(0, 5);
      setStats(nextStats);
      setAllChallenges(items);
      setSolvedChallenges(topSolved);
      setRecommendedChallenges(sortedRecommended);
      setKnowledgeProgress(nextKnowledge);

      dashboardCache = {
        stats: nextStats,
        allChallenges: items,
        recommendedChallenges: sortedRecommended,
        solvedChallenges: topSolved,
        knowledgeProgress: nextKnowledge,
        timestamp: Date.now(),
      };
    });

    return () => {
      mounted = false;
    };
  }, []);

  const activePath = mockLearningPaths[0];
  const completionPercentage =
    stats.totalChallenges > 0
      ? Math.round((stats.challengesCompleted / stats.totalChallenges) * 100)
      : 0;

  // Compute exact solved / total metrics across all live challenges
  const owaspMastery = useMemo(() => {
    const computeDomain = (
      label: string,
      colorClass: string,
      matcher: (c: any) => boolean,
      filterCategory: string,
    ) => {
      const matched = allChallenges.filter(matcher);
      const solved = matched.filter(
        (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved || c.solved,
      ).length;
      const total = matched.length;
      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { label, colorClass, solved, total, pct, filterCategory };
    };

    const textOf = (c: any) =>
      `${c.owaspReference || ''} ${getCategoryName(c)}`.toLowerCase();

    return [
      computeDomain(
        'A00: Web Security Fundamentals',
        'text-cyan-400',
        (c) => textOf(c).includes('foundation'),
        'Foundations',
      ),
      computeDomain(
        'A03: Injection (SQLi & Command)',
        'text-emerald-400',
        (c) => textOf(c).includes('injection') || textOf(c).includes('xss'),
        'sql-injection',
      ),
      computeDomain(
        'A01: Broken Access Control & IDOR',
        'text-sky-400',
        (c) =>
          textOf(c).includes('access') ||
          textOf(c).includes('idor') ||
          textOf(c).includes('traversal'),
        'auth-access-control',
      ),
      computeDomain(
        'A07: Authentication & JWT',
        'text-amber-400',
        (c) => textOf(c).includes('auth') || textOf(c).includes('jwt'),
        'jwt',
      ),
      computeDomain(
        'A10: SSRF & Server-Side Logic',
        'text-purple-400',
        (c) =>
          textOf(c).includes('ssrf') ||
          textOf(c).includes('api') ||
          textOf(c).includes('deserialization'),
        'ssrf',
      ),
    ];
  }, [allChallenges]);

  const foundationsProgress = useMemo(() => {
    const foundations = allChallenges.filter((c) =>
      getCategoryName(c).toLowerCase().includes('foundation'),
    );
    const total = foundations.length || 10;
    const solved = foundations.filter(
      (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved || c.solved,
    ).length;
    return {
      solved,
      total,
      pct: total > 0 ? Math.round((solved / total) * 100) : 0,
    };
  }, [allChallenges]);

  const totalLessons = knowledgeProgress?.totalLessons || stats.totalChallenges;
  const completedLessons = knowledgeProgress?.completedCount || 0;
  const unlockedLessons = isAdmin
    ? totalLessons
    : knowledgeProgress?.unlockedCount || 0;

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-5 font-sans pb-10 animate-fade-in">
      {/* ==================================================================== */}
      {/* 1. WELCOME HERO BANNER                                               */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/45 via-zinc-900/75 to-cyan-950/40 border border-emerald-500/20 p-5 md:p-6 shadow-xl backdrop-blur-sm">
        <div
          className="absolute -right-8 -bottom-10 opacity-[0.07] pointer-events-none select-none"
          aria-hidden="true"
        >
          <Shield className="w-60 h-60 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 max-w-3xl">
            <Link
              to="/settings"
              className="hidden sm:block shrink-0 group"
              title="Customize Avatar & Profile"
            >
              <div className="w-16 h-16 rounded-full border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.28)] overflow-hidden bg-cyber-bg transition-transform group-hover:scale-105">
                <img
                  src={getAvatarUrl(currentUser?.avatarUrl)}
                  alt={currentUser?.username || 'Operator'}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-semibold">
                    <Shield className="w-3 h-3" />
                    Admin Command Center • Arena Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-semibold">
                    <Zap className="w-3 h-3" />
                    Exploitation Arena Active
                  </span>
                )}
                <span className="text-[11px] font-mono text-cyber-muted hidden sm:inline">
                  {stats.domainCount} Security Domains • {stats.totalChallenges}{' '}
                  Live Labs
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-cyber-text tracking-tight">
                Welcome back,{' '}
                <span className="text-emerald-400 font-mono">
                  {currentUser?.username || 'Researcher'}
                </span>
              </h1>

              <p className="text-xs md:text-sm text-cyber-muted leading-relaxed">
                Target environment ready. You have completed{' '}
                <strong className="text-cyber-text font-mono">
                  {stats.challengesCompleted}
                </strong>{' '}
                of{' '}
                <span className="text-cyber-text font-mono">
                  {stats.totalChallenges}
                </span>{' '}
                challenges, accumulating{' '}
                <strong className="text-emerald-400 font-mono">
                  {stats.totalPoints.toLocaleString()}
                </strong>{' '}
                points.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/challenges">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 px-4 shadow-lg shadow-emerald-950/40 font-mono">
                <Target className="mr-1.5 h-3.5 w-3.5" />
                Browse Challenges
              </Button>
            </Link>
            <Link to="/learning-paths">
              <Button
                variant="outline"
                className="border-cyber-border bg-cyber-card/80 hover:bg-cyber-elevated text-xs h-9 px-3.5 text-cyber-text font-mono"
              >
                <Compass className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                Learning Paths
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin/knowledge">
                <Button
                  variant="outline"
                  className="border-purple-500/35 bg-purple-500/10 hover:bg-purple-500/20 text-xs h-9 px-3.5 text-purple-200 font-mono"
                >
                  <Settings className="mr-1.5 h-3.5 w-3.5 text-purple-300" />
                  Knowledge Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. KEY METRICS STATS GRID                                            */}
      {/* ==================================================================== */}
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
          value={stats.totalPoints.toLocaleString()}
          subValue="PTS"
          icon={Zap}
          trend="Real-time Verified"
          accentColor="cyan"
        />
        <StatCard
          label="Security Domains"
          value={stats.domainCount}
          subValue="Categories"
          icon={Shield}
          trend="OWASP, WSTG & ASVS"
          accentColor="purple"
        />
        <StatCard
          label="Security Knowledge"
          value={completedLessons}
          subValue={`/ ${totalLessons}`}
          icon={BookOpen}
          trend={
            isAdmin
              ? `Admin Master (${unlockedLessons}/${totalLessons} Unlocked)`
              : `${unlockedLessons} Unlocked Guides`
          }
          accentColor="amber"
        />
      </div>

      {/* Admin-only Quick Command Strip */}
      {isAdmin && (
        <div className="rounded-xl border border-purple-500/25 bg-purple-950/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-purple-300 font-semibold">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Administrator Quick Operations</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/knowledge"
              className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Admin ({totalLessons})</span>
            </Link>
            <Link
              to="/admin/management"
              className="px-2.5 py-1 rounded-lg bg-cyber-card hover:bg-cyber-elevated text-cyber-text border border-cyber-border transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Management</span>
            </Link>
            <Link
              to="/learning-progress"
              className="px-2.5 py-1 rounded-lg bg-cyber-card hover:bg-cyber-elevated text-cyber-text border border-cyber-border transition-colors inline-flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Progress Roadmap</span>
            </Link>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CURRICULUM ROADMAP & OWASP MASTERY                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Learning Path */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between space-y-5 shadow-md">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-cyan-400/20 to-transparent" />

          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyber-muted">
                  Curriculum Roadmap • Step 01 of {mockLearningPaths.length}
                </span>
              </div>
              <DifficultyBadge difficulty={activePath.difficulty} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-cyber-text tracking-tight">
                {activePath.title}
              </h2>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                {activePath.description}
              </p>
            </div>

            {/* Active Track Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyber-muted">
                  Foundations Track Progress ({foundationsProgress.solved} /{' '}
                  {foundationsProgress.total} labs)
                </span>
                <span className="text-emerald-400 font-bold">
                  {foundationsProgress.pct}%
                </span>
              </div>
              <Progress
                value={foundationsProgress.pct}
                className="h-2 bg-cyber-elevated"
              />
            </div>

            {/* Key Topics */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activePath.topics.map((topic) => (
                <span
                  key={topic}
                  className="text-[10.5px] font-mono px-2.5 py-0.5 rounded bg-cyber-elevated/80 border border-cyber-border text-slate-300"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Curriculum Summary Chips */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 px-3 py-2 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-cyber-text">
                    {mockLearningPaths.length} Paths
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">
                    Ordered Track
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 px-3 py-2 flex items-center gap-2">
                <Flag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-cyber-text">
                    {stats.totalChallenges} Labs
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">
                    Isolated Targets
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-cyber-border/70 bg-zinc-950/50 px-3 py-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-cyber-text">
                    {totalLessons} Guides
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">
                    Defense &amp; Fix
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border flex flex-wrap items-center justify-between gap-2.5">
            <Link
              to="/learning-progress"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyber-muted hover:text-emerald-400 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Interactive Progress Map</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/challenges?category=Foundations">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyber-border bg-cyber-elevated/60 hover:bg-cyber-elevated text-cyber-text text-xs h-8 font-mono"
                >
                  Start Foundations
                </Button>
              </Link>
              <Link to="/learning-paths">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-mono font-semibold"
                >
                  Explore Paths
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* OWASP & Security Domain Coverage */}
        <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between space-y-4 shadow-md">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-500/60 via-purple-400/20 to-transparent" />

          <div>
            <h3 className="text-sm font-bold text-cyber-text tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>OWASP Top 10 Mastery</span>
            </h3>
            <p className="text-[11px] text-cyber-muted mt-1">
              Live proficiency calculated across all {stats.totalChallenges}{' '}
              challenges.
            </p>

            <div className="space-y-3 mt-4 text-xs font-mono">
              {owaspMastery.map((item) => (
                <Link
                  key={item.label}
                  to={`/challenges?category=${encodeURIComponent(
                    item.filterCategory,
                  )}`}
                  className="block space-y-1 group"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-cyber-muted group-hover:text-cyber-text transition-colors truncate pr-2">
                      {item.label}
                    </span>
                    <span className={`${item.colorClass} shrink-0 font-bold`}>
                      {item.solved}/{item.total} ({item.pct}%)
                    </span>
                  </div>
                  <Progress
                    value={item.pct}
                    className="h-1.5 bg-cyber-elevated"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-cyber-border">
            <Link
              to="/challenges"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-between transition-colors"
            >
              <span>Explore Unsolved Vulnerabilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. RECOMMENDED NEXT CHALLENGES & ACTIVITY FEED                       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recommended Challenges */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-cyber-text">
                Recommended Starter Labs
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {recommendedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-sm group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-cyan-300/90 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded line-clamp-1">
                      {getCategoryName(challenge)}
                    </span>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </div>

                  <h4 className="text-xs font-bold text-cyber-text group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {challenge.title}
                  </h4>

                  <p className="text-[11px] text-cyber-muted leading-relaxed line-clamp-2">
                    {challenge.shortDescription || challenge.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-cyber-border/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{challenge.points}{' '}
                    <span className="text-[10px] font-normal text-cyber-muted">
                      PTS
                    </span>
                  </span>
                  <Link to={`/challenges/${challenge.slug}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-mono px-2.5 border-cyber-border bg-cyber-elevated/60 hover:bg-emerald-500/15 hover:border-emerald-500/35 hover:text-emerald-300 text-cyber-text transition-colors"
                    >
                      Enter Lab →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Solves & Platform Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-cyber-text">
                Recent Completions ({stats.challengesCompleted})
              </h3>
            </div>
            {stats.challengesCompleted > 0 && (
              <Link
                to="/profile"
                className="text-xs font-mono text-cyber-muted hover:text-emerald-400 transition-colors"
              >
                Timeline →
              </Link>
            )}
          </div>

          {solvedChallenges.length === 0 ? (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-6 text-center text-xs text-cyber-muted font-mono space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                <Flag className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-cyber-text font-semibold">
                  No challenges solved yet
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Launch a starter lab to capture your first flag and unlock
                  your solve feed.
                </p>
              </div>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
              >
                <span>Start First Lab</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-3 divide-y divide-cyber-border/60">
              {solvedChallenges.map((c) => (
                <div
                  key={c.id}
                  className="pt-3 first:pt-0 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <Link
                        to={`/challenges/${c.slug}`}
                        className="text-xs font-semibold text-cyber-text hover:text-emerald-400 transition-colors truncate"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <span className="text-[10px] text-cyber-muted font-mono block truncate">
                      {c.owaspReference || 'OWASP'} · {getCategoryName(c)}
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
                  className="text-xs font-mono text-cyber-muted hover:text-emerald-400 text-center block w-full py-1 transition-colors"
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

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Flame,
  Database,
  Code2,
  Cpu,
  Unlock,
  Zap,
  Crown,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Achievement } from '@/types';
import { apiClient } from '@/services/api';

export const AchievementsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch live user points
    apiClient
      .get('/users/me')
      .then((res) => {
        const u = res.data?.data || res.data;
        if (typeof u?.totalPoints === 'number') {
          setTotalPoints(u.totalPoints);
        }
      })
      .catch(() => {});

    // 2. Fetch live solved challenges
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.items;
        if (Array.isArray(items)) {
          const solved = items.filter(
            (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved
          );
          setSolvedChallenges(solved);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Fundamentals', 'Exploitation', 'Streaks', 'Special'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-sky-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Unlock':
        return <Unlock className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-500" />;
      default:
        return <Award className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Dynamically compute achievements based on real database solves
  const achievements: Achievement[] = useMemo(() => {
    const totalSolved = solvedChallenges.length;
    const sqliSolved = solvedChallenges.filter((c) =>
      (c.category?.name || c.category || '').toLowerCase().includes('sql')
    ).length;
    const xssSolved = solvedChallenges.filter((c) =>
      (c.category?.name || c.category || '').toLowerCase().includes('xss')
    ).length;
    const apiSolved = solvedChallenges.filter((c) =>
      (c.category?.name || c.category || '').toLowerCase().includes('api')
    ).length;
    const idorSolved = solvedChallenges.filter((c) =>
      (c.category?.name || c.category || '').toLowerCase().includes('idor')
    ).length;

    return [
      {
        id: 'ach-01',
        title: 'First Blood',
        description: 'Successfully submit your first valid CTF flag on any web challenge.',
        category: 'Fundamentals',
        points: 50,
        unlocked: totalSolved >= 1,
        unlockedAt: totalSolved >= 1 ? 'Earned' : undefined,
        icon: 'Flame',
      },
      {
        id: 'ach-02',
        title: 'SQL Hunter',
        description: 'Solve 3 different SQL Injection vulnerability challenges.',
        category: 'Exploitation',
        points: 150,
        unlocked: sqliSolved >= 3,
        unlockedAt: sqliSolved >= 3 ? 'Earned' : undefined,
        icon: 'Database',
        progress: { current: sqliSolved, max: 3 },
      },
      {
        id: 'ach-03',
        title: 'XSS Explorer',
        description: 'Successfully trigger script execution in both Reflected and DOM XSS challenges.',
        category: 'Exploitation',
        points: 150,
        unlocked: xssSolved >= 2,
        unlockedAt: xssSolved >= 2 ? 'Earned' : undefined,
        icon: 'Code2',
        progress: { current: xssSolved, max: 2 },
      },
      {
        id: 'ach-04',
        title: 'API Security Beginner',
        description: 'Complete your first REST API authorization or mass assignment challenge.',
        category: 'Fundamentals',
        points: 100,
        unlocked: apiSolved >= 1,
        unlockedAt: apiSolved >= 1 ? 'Earned' : undefined,
        icon: 'Cpu',
        progress: { current: apiSolved, max: 1 },
      },
      {
        id: 'ach-05',
        title: 'Access Control Breaker',
        description: 'Identify and exploit an Insecure Direct Object Reference (IDOR) flaw.',
        category: 'Exploitation',
        points: 200,
        unlocked: idorSolved >= 1,
        unlockedAt: idorSolved >= 1 ? 'Earned' : undefined,
        icon: 'Unlock',
        progress: { current: idorSolved, max: 1 },
      },
      {
        id: 'ach-06',
        title: 'Streak Sentinel',
        description: 'Solve at least 7 vulnerability challenges in the arena.',
        category: 'Streaks',
        points: 250,
        unlocked: totalSolved >= 7,
        unlockedAt: totalSolved >= 7 ? 'Earned' : undefined,
        icon: 'Zap',
        progress: { current: Math.min(totalSolved, 7), max: 7 },
      },
      {
        id: 'ach-07',
        title: 'Zero to Hero',
        description: 'Accumulate 1,000 total platform points.',
        category: 'Fundamentals',
        points: 300,
        unlocked: totalPoints >= 1000,
        unlockedAt: totalPoints >= 1000 ? 'Earned' : undefined,
        icon: 'Award',
        progress: { current: Math.min(totalPoints, 1000), max: 1000 },
      },
      {
        id: 'ach-08',
        title: 'Challenge Master',
        description: 'Solve at least 25 challenges across the vulnerability categories.',
        category: 'Special',
        points: 1000,
        unlocked: totalSolved >= 25,
        unlockedAt: totalSolved >= 25 ? 'Earned' : undefined,
        icon: 'Crown',
        progress: { current: Math.min(totalSolved, 25), max: 25 },
      },
    ];
  }, [solvedChallenges, totalPoints]);

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCategory === 'All') return true;
    return ach.category === selectedCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Achievements & Badges
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted">
            Track offensive milestones, exploitation streaks, and protocol masteries.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs font-mono text-cyber-muted">
          <span>Unlocked:</span>{' '}
          <strong className="text-emerald-400">{unlockedCount}</strong> / {achievements.length}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              selectedCategory === cat
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-semibold'
                : 'bg-cyber-card text-cyber-muted border-cyber-border hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => (
          <div
            key={ach.id}
            className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
              ach.unlocked
                ? 'bg-cyber-card border-cyber-border hover:border-slate-700 shadow-md'
                : 'bg-cyber-card/40 border-cyber-border/60 opacity-80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    ach.unlocked
                      ? 'bg-cyber-elevated border-cyber-border'
                      : 'bg-cyber-bg border-cyber-border text-cyber-muted'
                  }`}
                >
                  {ach.unlocked ? (
                    getIcon(ach.icon)
                  ) : (
                    <Lock className="w-4 h-4 text-cyber-muted" />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated text-cyber-muted">
                    {ach.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{ach.points} PTS
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-cyber-text">
                  {ach.title}
                </h3>
                <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>

            {/* Bottom Status / Progress */}
            <div className="pt-3 border-t border-cyber-border/80 text-xs font-mono">
              {ach.unlocked ? (
                <div className="flex items-center text-emerald-400 gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unlocked on {ach.unlockedAt || 'Recent'}</span>
                </div>
              ) : ach.progress ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-cyber-muted">
                    <span>Progress</span>
                    <span>
                      {ach.progress.current} / {ach.progress.max}
                    </span>
                  </div>
                  <Progress
                    value={(ach.progress.current / ach.progress.max) * 100}
                    className="h-1.5 bg-cyber-elevated"
                  />
                </div>
              ) : (
                <div className="flex items-center text-cyber-muted gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked Milestone</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;

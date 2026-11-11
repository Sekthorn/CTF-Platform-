import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Unlock,
  Terminal,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeProgress } from '@/types';

export const LearningProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<KnowledgeProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await knowledgeService.getProgress();
      const data = res?.data || res;
      setProgress(data);
    } catch (err: any) {
      console.error('Failed to load learning progress:', err);
      setError('Unable to load learning analytics. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Aggregating security mastery analytics...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-mono font-bold text-zinc-100">Progress Unavailable</h2>
        <p className="text-zinc-400 text-sm">{error || 'Could not load your learning metrics.'}</p>
        <Button variant="outline" size="sm" onClick={loadProgress}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    totalLessons,
    unlockedCount,
    completedCount,
    solvedChallengesCount,
    completionPercentage,
    categories,
  } = progress;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-10 w-full max-w-[1720px] mx-auto font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-1">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Security Knowledge Library</span>
        </Link>

        <Link to="/challenges">
          <Button variant="outline" size="sm" className="font-mono text-xs border-zinc-800 gap-1.5 h-8">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            CTF Challenges Arena
          </Button>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-cyan-950/40 border border-emerald-500/20 p-5 md:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cybersecurity Learning Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-zinc-100">
            My Security Learning Progress
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
            Track your journey from CTF flag capture to deep defense understanding. Every challenge you solve
            unlocks its corresponding architectural dossier.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span>Overall Security Mastery</span>
            <span className="text-emerald-400 font-bold">{completionPercentage}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Lessons */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Catalog Total</span>
            <BookOpen className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">{totalLessons}</div>
          <p className="text-xs text-zinc-500 font-mono">Curated lessons</p>
        </div>

        {/* Challenges Solved */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Flags Captured</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">{solvedChallengesCount}</div>
          <p className="text-xs text-zinc-500 font-mono">Challenges conquered</p>
        </div>

        {/* Unlocked Lessons */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Unlocked</span>
            <Unlock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">{unlockedCount}</div>
          <p className="text-xs text-zinc-500 font-mono">Ready to study</p>
        </div>

        {/* Completed Lessons */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">{completedCount}</div>
          <p className="text-xs text-zinc-500 font-mono">Marked completed</p>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <div className="space-y-3.5">
        <h2 className="text-lg md:text-xl font-mono font-bold text-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Progress by Security Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const unlockedRatio = cat.total > 0 ? Math.round((cat.unlocked / cat.total) * 100) : 0;

            return (
              <div
                key={cat.category}
                className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-3 hover:border-zinc-700 transition-colors shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="font-mono font-bold text-sm text-zinc-100 capitalize">
                    {cat.category.replace(/-/g, ' ')}
                  </h3>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>
                      Unlocked: <strong className="text-cyan-400">{cat.unlocked}</strong> / {cat.total}
                    </span>
                    <span>
                      Done: <strong className="text-emerald-400">{cat.completed}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${cat.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{cat.completionPercentage}% Mastered</span>
                    <span>{unlockedRatio}% Unlocked</span>
                  </div>
                </div>

                <Link
                  to={`/knowledge?category=${cat.category}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 pt-2 border-t border-zinc-800/80 w-full"
                >
                  <span>Explore {cat.category.split('-')[0]} Guides</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningProgressPage;

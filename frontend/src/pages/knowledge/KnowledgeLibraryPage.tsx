import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Shield,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeLessonListItem } from '@/types';

const CATEGORIES = [
  { label: 'All Categories', slug: 'all' },
  { label: 'Web Security Fundamentals', slug: 'Foundations' },
  { label: 'Authentication & Access Control', slug: 'auth-access-control' },
  { label: 'SQL Injection', slug: 'sql-injection' },
  { label: 'Cross-Site Scripting (XSS)', slug: 'cross-site-scripting' },
  { label: 'File Handling & Path Traversal', slug: 'file-handling-path-traversal' },
  { label: 'API Security & Server-Side', slug: 'api-security-server-side' },
  { label: 'Insecure Direct Object Reference (IDOR)', slug: 'idor' },
  { label: 'Server-Side Request Forgery (SSRF)', slug: 'ssrf' },
  { label: 'Command Injection', slug: 'command-injection' },
  { label: 'JSON Web Token (JWT)', slug: 'jwt' },
  { label: 'Business Logic Vulnerabilities', slug: 'business-logic' },
  { label: 'Insecure Deserialization', slug: 'insecure-deserialization' },
];

const DIFFICULTIES = ['ALL', 'BEGINNER', 'EASY', 'MEDIUM', 'HARD'];

export const KnowledgeLibraryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState<KnowledgeLessonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    searchParams.get('difficulty') || 'ALL'
  );
  const [unlockFilter, setUnlockFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>(
    (searchParams.get('status') as any) || 'ALL'
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await knowledgeService.getLessons({ limit: 100 });
      const items = Array.isArray(res) ? res : (res?.items || res?.data?.items || []);
      setLessons(items);
    } catch (err: any) {
      console.error('Failed to load knowledge lessons:', err);
      setError('Unable to load security lessons. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.owaspReference && l.owaspReference.toLowerCase().includes(q)) ||
        (l.cweReference && l.cweReference.toLowerCase().includes(q)) ||
        l.challenge.title.toLowerCase().includes(q);

      // Category
      const matchesCategory =
        selectedCategory === 'all' ||
        l.category === selectedCategory ||
        l.category.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '') ||
        (selectedCategory === 'idor' && l.category.toLowerCase().includes('idor')) ||
        (selectedCategory === 'ssrf' && l.category.toLowerCase().includes('ssrf')) ||
        (selectedCategory === 'command-injection' && l.category.toLowerCase().includes('command')) ||
        (selectedCategory === 'jwt' && l.category.toLowerCase().includes('jwt')) ||
        (selectedCategory === 'business-logic' && l.category.toLowerCase().includes('business')) ||
        (selectedCategory === 'insecure-deserialization' && l.category.toLowerCase().includes('deserialization'));

      // Difficulty
      const matchesDifficulty =
        selectedDifficulty === 'ALL' ||
        l.difficulty.toUpperCase() === selectedDifficulty.toUpperCase();

      // Unlock filter
      const lessonUnlocked = isAdmin || l.isUnlocked;
      const matchesUnlock =
        unlockFilter === 'ALL'
          ? true
          : unlockFilter === 'UNLOCKED'
          ? lessonUnlocked
          : !lessonUnlocked;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesUnlock;
    });
  }, [lessons, search, selectedCategory, selectedDifficulty, unlockFilter, isAdmin]);

  const unlockedCount = isAdmin ? (lessons.length || 63) : lessons.filter((l) => l.isUnlocked).length;
  const completedCount = lessons.filter((l) => l.isCompleted).length;

  const getCategoryCount = (catSlug: string) => {
    if (catSlug === 'all') return lessons.length;
    return lessons.filter((l) => {
      if (l.category === catSlug) return true;
      const normalizedL = l.category.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedC = catSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedL === normalizedC) return true;
      if (catSlug === 'idor' && l.category.toLowerCase().includes('idor')) return true;
      if (catSlug === 'ssrf' && l.category.toLowerCase().includes('ssrf')) return true;
      if (catSlug === 'command-injection' && l.category.toLowerCase().includes('command')) return true;
      if (catSlug === 'jwt' && l.category.toLowerCase().includes('jwt')) return true;
      if (catSlug === 'business-logic' && l.category.toLowerCase().includes('business')) return true;
      if (catSlug === 'insecure-deserialization' && l.category.toLowerCase().includes('deserialization')) return true;
      return false;
    }).length;
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-5 animate-fade-in pb-10 font-sans">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-cyan-950/40 border border-emerald-500/20 p-5 md:p-6 overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl xl:max-w-4xl flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lessons.length} Structured Penetration Testing Guides</span>
              </div>
              {isAdmin && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Master Access ({lessons.length}/{lessons.length} Unlocked)</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-zinc-100 font-mono sm:whitespace-nowrap">
              Security Knowledge & Defense Library
            </h1>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Every challenge has an individual, verified security lesson. Solve CTF challenges to unlock
              in-depth root cause analysis, real-world exploitation mechanisms, prevention strategies, and
              side-by-side code remediations.
            </p>
          </div>

          {/* Quick Analytics Pill Box */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 shrink-0">
            <div className="text-center px-4 border-r border-zinc-800">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {unlockedCount} / {lessons.length}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Unlocked</div>
            </div>
            <div className="text-center px-4 border-r border-zinc-800">
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {completedCount}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Completed</div>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <Link to="/learning-progress">
                <Button variant="outline" size="sm" className="font-mono text-xs border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  My Progress
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin/knowledge">
                  <Button variant="outline" size="sm" className="font-mono text-xs border-purple-500/40 hover:bg-purple-500/10 text-purple-300 gap-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    Knowledge Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search vulnerability, CWE, OWASP, or challenge title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/70 border-zinc-800 focus:border-emerald-500 font-mono text-sm"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900/70 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Unlock State Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900/70 p-1 rounded-lg border border-zinc-800">
            {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setUnlockFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  unlockFilter === status
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills - Multi-row wrapped with live counts and ZERO horizontal scrolling */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.slug);
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-black/25 text-zinc-950 font-black'
                      : 'bg-zinc-800/90 text-zinc-500 border border-zinc-700/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Loading security lessons catalog...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6 rounded-xl bg-red-950/20 border border-red-500/30 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-red-300 font-mono text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredLessons.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-lg font-mono font-bold text-zinc-200">No matching security lessons found</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Try adjusting your search criteria or filter to see more guides.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedDifficulty('ALL');
              setUnlockFilter('ALL');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Lessons Grid */}
      {!isLoading && !error && filteredLessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredLessons.map((lesson) => {
            const isUnlocked = isAdmin || lesson.isUnlocked;
            const isCompleted = lesson.isCompleted;

            return (
              <div
                key={lesson.id}
                className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
                    : 'bg-zinc-950/60 border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/30'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <DifficultyBadge difficulty={lesson.difficulty as any} />

                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}

                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          <Unlock className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description (Full, clear text display without truncation) */}
                  <div className="space-y-1.5">
                    <h3 className="font-mono font-bold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Security Standards Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {lesson.owaspReference && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {lesson.owaspReference.split('–')[0].trim()}
                      </span>
                    )}
                    {lesson.cweReference && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {lesson.cweReference.split(':')[0]}
                      </span>
                    )}
                    {lesson.cvssScore && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        CVSS {lesson.cvssScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-5 mt-5 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-zinc-500">
                    Challenge:{' '}
                    <Link
                      to={`/challenges/${lesson.challenge.slug}`}
                      className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700 underline-offset-2"
                    >
                      {lesson.challenge.points} pts
                    </Link>
                  </div>

                  <Link to={`/knowledge/${lesson.slug}`}>
                    <Button
                      size="sm"
                      variant={isUnlocked ? 'default' : 'outline'}
                      className={`font-mono text-xs gap-1.5 ${
                        isUnlocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold'
                          : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          Study Guide
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Preview Info
                          <Lock className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KnowledgeLibraryPage;

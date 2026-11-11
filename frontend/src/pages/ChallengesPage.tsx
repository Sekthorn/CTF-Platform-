import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Flag,
  LayoutGrid,
  List,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiClient } from '@/services/api';
import { mockChallenges } from '@/data/mock/challenges';
import { Challenge } from '@/types';

export const ChallengesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // State
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [search, setSearch] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [sortBy, setSortBy] = useState<'points-desc' | 'points-asc' | 'solves-desc' | 'newest'>('points-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Attempt live fetch from backend API
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const data = res.data?.data?.items || res.data?.items;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Challenge[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            category: item.category?.name || 'Authentication & Access Control',
            difficulty: item.difficulty || 'Medium',
            points: item.points || 100,
            owaspReference: item.references?.[0]?.identifier || 'OWASP Top 10',
            cweReference: item.references?.[1]?.identifier || 'CWE-Generic',
            shortDescription: item.description || '',
            description: item.description,
            solved: item.userProgress?.status === 'SOLVED',
            solvedCount: item.solvedCount || 0,
            author: 'WebSec Core Team',
            createdAt: item.createdAt || '2026-01-01',
            tags: ['Live Lab', 'Dynamic Flag'],
          }));
          // Merge API data with mockChallenges to preserve newly added challenges
          // (IDOR, SSRF, Command Injection, JWT, Business Logic, Insecure Deserialization)
          // even when backend DB has not yet been seeded with the newest batches.
          const apiSlugs = new Set(mapped.map((c: any) => c.slug));
          const unseededMock = mockChallenges.filter((m) => !apiSlugs.has(m.slug));
          setChallenges([...mapped, ...unseededMock]);
        }
      })
      .catch(() => {
        // Retain mockChallenges on backend downtime
      });
  }, []);

  const categories = [
    'All',
    'Authentication & Access Control',
    'SQL Injection',
    'Cross-Site Scripting (XSS)',
    'File Handling & Path Traversal',
    'API Security & Server-Side Vulnerabilities',
    'Insecure Direct Object Reference (IDOR)',
    'Server-Side Request Forgery (SSRF)',
    'Command Injection',
    'JSON Web Token (JWT)',
    'Business Logic Vulnerabilities',
    'Insecure Deserialization',
  ];

  // Filtering & Sorting
  const filteredChallenges = useMemo(() => {
    return challenges
      .filter((c) => {
        // Search
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          c.title.toLowerCase().includes(query) ||
          c.shortDescription.toLowerCase().includes(query) ||
          c.owaspReference.toLowerCase().includes(query) ||
          (c.cweReference && c.cweReference.toLowerCase().includes(query)) ||
          c.tags.some((t) => t.toLowerCase().includes(query));

        // Category
        const matchesCategory =
          selectedCategory === 'All' || c.category === selectedCategory;

        // Difficulty
        const matchesDifficulty =
          selectedDifficulty === 'All' || c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

        // Status
        const matchesStatus =
          selectedStatus === 'All'
            ? true
            : selectedStatus === 'Solved'
            ? c.solved
            : !c.solved;

        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'points-desc') return b.points - a.points;
        if (sortBy === 'points-asc') return a.points - b.points;
        if (sortBy === 'solves-desc') return b.solvedCount - a.solvedCount;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [challenges, search, selectedCategory, selectedDifficulty, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
    setSortBy('points-desc');
  };

  const solvedCount = challenges.filter((c) => c.solved).length;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Header & Quick Solved Ratio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-400" />
            Vulnerability Challenges
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted">
            Practice real offensive security scenarios aligned with OWASP Top 10, ASVS, and CWE.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyber-muted">
          <div className="px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border flex items-center gap-2">
            <span>Solved:</span>
            <strong className="text-emerald-400">{solvedCount}</strong>
            <span className="text-slate-500">/</span>
            <span>{challenges.length}</span>
          </div>

          <div className="flex items-center rounded-lg border border-cyber-border bg-cyber-card p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-cyber-elevated text-emerald-400' : 'text-cyber-muted hover:text-cyber-text'}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-cyber-elevated text-emerald-400' : 'text-cyber-muted hover:text-cyber-text'}`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter Controls & Sorters (Streamlined, Space-Optimized Layout) */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Search Input (flex-1) */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <Input
              type="text"
              placeholder="Search vulnerability, CWE, OWASP, or challenge title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-cyber-card border-cyber-border text-cyber-text placeholder:text-cyber-muted/60 focus:border-emerald-500 font-mono text-xs h-9.5 rounded-lg shadow-sm w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Segmented Filter */}
            <div className="flex items-center gap-1 bg-cyber-card p-1 rounded-lg border border-cyber-border shadow-sm">
              {(['ALL', 'BEGINNER', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => {
                const isSelected =
                  (diff === 'ALL' && selectedDifficulty === 'All') ||
                  selectedDifficulty.toUpperCase() === diff;
                return (
                  <button
                    key={diff}
                    onClick={() =>
                      setSelectedDifficulty(
                        diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()
                      )
                    }
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                        : 'text-cyber-muted hover:text-cyber-text font-medium'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {/* Solved Status Segmented Filter */}
            <div className="flex items-center gap-1 bg-cyber-card p-1 rounded-lg border border-cyber-border shadow-sm">
              {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((status) => {
                const isSelected =
                  (status === 'ALL' && selectedStatus === 'All') ||
                  (status === 'UNLOCKED' && selectedStatus === 'Solved') ||
                  (status === 'LOCKED' && selectedStatus === 'Unsolved');

                return (
                  <button
                    key={status}
                    onClick={() =>
                      setSelectedStatus(
                        status === 'ALL' ? 'All' : status === 'UNLOCKED' ? 'Solved' : 'Unsolved'
                      )
                    }
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40 shadow-sm'
                        : 'text-cyber-muted hover:text-cyber-text font-medium'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Compact Sorter Dropdown */}
            <div className="flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9.5 rounded-lg border border-cyber-border bg-cyber-card px-2.5 text-xs font-mono text-cyber-text shadow-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="points-desc">Sort: Highest PTS</option>
                <option value="points-asc">Sort: Lowest PTS</option>
                <option value="solves-desc">Sort: Most Solves</option>
                <option value="newest">Sort: Newest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Matrix - Wrapped, Zero Horizontal Scrolling, Sleek Full-Width Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? challenges.length
                : challenges.filter((c) => c.category === cat).length;
            const isSelected = selectedCategory === cat;
            const label = cat === 'All' ? 'All Categories' : cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-150 select-none cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                    : 'bg-cyber-card text-cyber-muted border border-cyber-border/80 hover:border-slate-600 hover:text-cyber-text hover:bg-cyber-elevated font-medium'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-black/25 text-zinc-950 font-black'
                      : 'bg-slate-900/80 text-cyber-muted border border-cyber-border/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Challenge Results */}
      {filteredChallenges.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View - Clean, compact spacing */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`rounded-xl border transition-all flex flex-col justify-between p-4 sm:p-4.5 ${
                  challenge.solved
                    ? 'bg-cyber-card/70 border-cyber-border hover:border-emerald-800/60'
                    : 'bg-cyber-card border-cyber-border hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted truncate">
                      {challenge.category}
                    </span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {challenge.solved && (
                        <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Solved
                        </span>
                      )}
                      <DifficultyBadge difficulty={challenge.difficulty} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <Link
                      to={`/challenges/${challenge.slug}`}
                      className="text-sm font-bold text-cyber-text hover:text-emerald-400 transition-colors leading-snug line-clamp-1 block"
                      title={challenge.title}
                    >
                      {challenge.title}
                    </Link>
                    <p className="text-xs text-cyber-muted leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {challenge.shortDescription}
                    </p>
                  </div>

                  {/* References & Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated/80 border border-cyber-border/70 text-cyber-muted">
                      {challenge.owaspReference}
                    </span>
                    {challenge.cweReference && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated/80 border border-cyber-border/70 text-cyber-muted">
                        {challenge.cweReference}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with points & action button */}
                <div className="pt-3 mt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold text-sm">{challenge.points}</span>
                    <span className="text-cyber-muted ml-1 text-xs">PTS</span>
                    <span className="text-cyber-muted/70 text-[10px] ml-1.5">({challenge.solvedCount} solves)</span>
                  </div>

                  <Link to={`/challenges/${challenge.slug}`}>
                    <Button
                      size="sm"
                      variant={challenge.solved ? 'outline' : 'default'}
                      className={`h-7.5 text-xs font-medium px-3 ${
                        challenge.solved
                          ? 'border-cyber-border bg-cyber-elevated/40 hover:bg-cyber-elevated text-cyber-text'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {challenge.solved ? 'Review Workspace' : 'Start Challenge'}
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl border border-cyber-border bg-cyber-card divide-y divide-cyber-border overflow-hidden">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-cyber-elevated/40 transition-colors"
              >
                <div className="space-y-1 md:max-w-xl">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/challenges/${challenge.slug}`}
                      className="text-sm font-bold text-cyber-text hover:text-emerald-400 transition-colors"
                    >
                      {challenge.title}
                    </Link>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                    {challenge.solved && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" /> Solved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyber-muted line-clamp-1">
                    {challenge.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-muted pt-0.5">
                    <span>{challenge.category}</span>
                    <span>•</span>
                    <span>{challenge.owaspReference}</span>
                    {challenge.cweReference && (
                      <>
                        <span>•</span>
                        <span>{challenge.cweReference}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-left md:text-right font-mono text-xs">
                    <div className="text-emerald-400 font-bold text-sm">+{challenge.points} PTS</div>
                    <div className="text-[10px] text-cyber-muted">{challenge.solvedCount} solves</div>
                  </div>

                  <Link to={`/challenges/${challenge.slug}`}>
                    <Button
                      size="sm"
                      className={`h-7.5 text-xs ${
                        challenge.solved
                          ? 'border-cyber-border bg-cyber-elevated text-cyber-text hover:bg-slate-800'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {challenge.solved ? 'Review' : 'Start'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No challenges found"
          description="No challenges match your search query and active filters. Try resetting the filters to view all scenarios."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
};

export default ChallengesPage;

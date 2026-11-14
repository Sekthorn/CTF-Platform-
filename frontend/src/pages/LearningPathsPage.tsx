import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Shield,
  Database,
  Code,
  Key,
  Cpu,
  Clock,
  BookOpen,
  Flag,
  ArrowRight,
  Search,
  Fingerprint,
  FolderTree,
  Binary,
  Globe,
  Terminal,
  Workflow,
  Boxes,
  BookMarked,
  Lock,
  Unlock,
  CheckCircle2,
  MapPin,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { mockLearningPaths } from '@/data/mock/learningPaths';
import { apiClient } from '@/services/api';
import { knowledgeService } from '@/services/knowledge.service';
import { LearningPathReference, KnowledgeProgress } from '@/types';
import {
  ROADMAP_NODES,
  FINAL_NODE_INDEX,
  findRoadmapNodeForCategory,
  getDynamicCategoryStats,
  getNodeCategoryStats,
  getSequentialUnlockedIndex,
} from '@/constants/learningRoadmap';

export const LearningPathsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>([]);
  const [knowledgeProgress, setKnowledgeProgress] = useState<KnowledgeProgress | null>(null);
  const [previewPlayerLock, setPreviewPlayerLock] = useState(false);

  useEffect(() => {
    setCategoryFilter(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.items;
        if (Array.isArray(items)) {
          setAllChallenges(items);
          const solved = items.filter(
            (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved || c.solved
          );
          setSolvedChallenges(solved);
        }
      })
      .catch(() => {});

    knowledgeService
      .getProgress()
      .then((res: any) => {
        setKnowledgeProgress(res?.data || res);
      })
      .catch(() => {});
  }, []);

  const maxUnlockedIndex = useMemo(
    () => getSequentialUnlockedIndex(knowledgeProgress?.categories),
    [knowledgeProgress]
  );

  const dynamicPaths = useMemo(() => {
    const mapped = mockLearningPaths.map((path) => {
      const roadmapNode = findRoadmapNodeForCategory(path.targetCategory || path.category);
      const roadmapIdx = roadmapNode
        ? ROADMAP_NODES.findIndex((n) => n.id === roadmapNode.id)
        : -1;
      const isPlayerUnlocked = roadmapIdx === -1 || roadmapIdx <= maxUnlockedIndex;
      const isUnlocked = (isAdmin && !previewPlayerLock) || isPlayerUnlocked;
      const pathStats = roadmapNode
        ? getNodeCategoryStats(knowledgeProgress?.categories, roadmapNode)
        : getDynamicCategoryStats(
            knowledgeProgress?.categories,
            path.targetCategory || path.category,
            path.lessonsCount
          );
      const isMastered = Boolean(pathStats.isCompleted);

      const matchesCategoryItem = (c: any) => {
        const catName = (c.category?.name || c.category || '').toLowerCase();
        const catSlug = (c.category?.slug || '').toLowerCase();
        const pathCat = (path.targetCategory || path.category).toLowerCase();
        return (
          catName === pathCat ||
          catSlug === pathCat ||
          catName.includes(pathCat) ||
          pathCat.includes(catName)
        );
      };

      const matchingTotalChallenges = allChallenges.filter(matchesCategoryItem).length;
      const matchingSolved = solvedChallenges.filter(matchesCategoryItem).length;

      const dynamicChallengesCount =
        allChallenges.length > 0 ? matchingTotalChallenges : path.challengesCount;
      const completedCount = knowledgeProgress ? pathStats.completed : matchingSolved;
      const totalLabs = pathStats.total || dynamicChallengesCount || 1;
      const progressPercentage = knowledgeProgress
        ? pathStats.pct
        : Math.min(Math.round((matchingSolved / totalLabs) * 100), 100);

      return {
        ...path,
        roadmapLevel: roadmapNode?.level ?? 'FOUNDATIONS',
        roadmapOrder: roadmapIdx === -1 ? -1 : roadmapIdx,
        lessonsCategoryParam:
          roadmapNode?.categorySlug === 'foundations'
            ? 'Foundations'
            : roadmapNode?.categorySlug || path.category,
        isPlayerUnlocked,
        isUnlocked,
        isMastered,
        blockingCategoryName:
          !isUnlocked && maxUnlockedIndex < FINAL_NODE_INDEX ? ROADMAP_NODES[maxUnlockedIndex].name : null,
        lessonsCount: knowledgeProgress ? pathStats.total : path.lessonsCount,
        challengesCount: dynamicChallengesCount,
        completedLessons: completedCount,
        progressPercentage,
      };
    });

    // Display Foundations first, then align cards in exact sequential Roadmap learning order (LVL 1 -> LVL 12)
    return mapped.sort((a, b) => a.roadmapOrder - b.roadmapOrder);
  }, [allChallenges, solvedChallenges, knowledgeProgress, maxUnlockedIndex, isAdmin, previewPlayerLock]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-sky-400" />;
      case 'Fingerprint':
        return <Fingerprint className="w-5 h-5 text-cyan-400" />;
      case 'FolderTree':
        return <FolderTree className="w-5 h-5 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-emerald-300" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-red-400" />;
      case 'Key':
        return <Key className="w-5 h-5 text-yellow-400" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-orange-400" />;
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-pink-400" />;
      default:
        return <Shield className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getReferenceBadgeStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'OWASP':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50 hover:bg-cyan-900/60';
      case 'WSTG':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60';
      case 'ASVS':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/50 hover:bg-teal-900/60';
      case 'CWE':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/50 hover:bg-amber-900/60';
      case 'RFC':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/50 hover:bg-purple-900/60';
      case 'MITRE':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/50 hover:bg-rose-900/60';
      case 'NIST':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/50 hover:bg-sky-900/60';
      case 'PTES':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/60';
      default:
        return 'bg-cyber-elevated text-cyber-muted border-cyber-border hover:text-cyber-text';
    }
  };

  const filteredPaths = dynamicPaths.filter((path) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      path.title.toLowerCase().includes(query) ||
      path.description.toLowerCase().includes(query) ||
      path.topics.some((t) => t.toLowerCase().includes(query)) ||
      (path.references &&
        path.references.some(
          (r: LearningPathReference) =>
            r.identifier.toLowerCase().includes(query) ||
            r.name.toLowerCase().includes(query) ||
            r.type.toLowerCase().includes(query)
        ));

    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      path.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const filterNode = categoryFilter ? findRoadmapNodeForCategory(categoryFilter) : undefined;
    const pathNode = categoryFilter
      ? findRoadmapNodeForCategory(path.targetCategory || path.category)
      : undefined;
    const matchesByRoadmapNode = Boolean(filterNode && pathNode && filterNode.id === pathNode.id);

    const filterCatNorm = categoryFilter.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pathCatNorm = (path.targetCategory || path.category).toLowerCase().replace(/[^a-z0-9]/g, '');
    const pathSlugNorm = path.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesCategoryParam =
      !filterCatNorm ||
      matchesByRoadmapNode ||
      pathCatNorm === filterCatNorm ||
      pathCatNorm.includes(filterCatNorm) ||
      filterCatNorm.includes(pathCatNorm) ||
      pathSlugNorm.includes(filterCatNorm);

    return matchesSearch && matchesDifficulty && matchesCategoryParam;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              {isAdmin ? 'Curriculum & Pathways Console' : 'Curated Learning Paths'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              {dynamicPaths.length} Structured Roadmaps
            </span>
            {categoryFilter && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('');
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25 cursor-pointer"
                title="Clear roadmap category filter"
              >
                <span>Focus: {findRoadmapNodeForCategory(categoryFilter)?.name || categoryFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40">
                <Shield className="w-3 h-3" />
                ADMIN UNRESTRICTED
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-cyber-muted mt-1">
            {isAdmin
              ? 'Admin Console: Inspect all 12 learning tracks freely, monitor player progression gates, and jump straight to Knowledge Admin.'
              : 'Offensive security pathways grounded in global security standards (OWASP Top 10, WSTG v4.2, CWE, NIST SP 800, MITRE ATT&CK, IETF RFCs).'}
          </p>
        </div>

        {/* Search, Difficulty Filter & Interactive Roadmap link */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-cyber-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pathways, CWE, OWASP..."
              className="pl-8 text-xs h-9 bg-cyber-card border-cyber-border text-cyber-text placeholder:text-cyber-muted/60"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-9 rounded-lg border border-cyber-border bg-cyber-card px-3 text-xs text-cyber-text shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Easy">Beginner</option>
            <option value="Medium">Intermediate</option>
            <option value="Hard">Advanced</option>
          </select>

          <Link
            to="/learning-progress"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Roadmap Inspector' : 'Interactive Roadmap'}</span>
          </Link>
        </div>
      </div>

      {/* Admin-Only Control Strip */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-950/20 px-4 py-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Normal players unlock up to{' '}
              <strong className="text-emerald-400">
                {ROADMAP_NODES[maxUnlockedIndex].level} ({ROADMAP_NODES[maxUnlockedIndex].name})
              </strong>
              . Admins have unrestricted access unless Player Lock Preview is toggled.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewPlayerLock((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-mono transition-colors ${
                previewPlayerLock
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              {previewPlayerLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{previewPlayerLock ? 'Player Lock Preview: ON' : 'Admin Access: All Open'}</span>
            </button>
            <Link
              to="/admin/knowledge"
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 text-xs font-mono"
            >
              <span>Knowledge Admin &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      {/* Pathways Grid */}
      {filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPaths.map((path) => (
            <div
              key={path.id}
              className={`rounded-xl border p-6 flex flex-col justify-between space-y-4 transition-all shadow-lg ${
                path.isUnlocked
                  ? 'border-cyber-border bg-cyber-card hover:border-slate-700'
                  : 'border-cyber-border/60 bg-cyber-card/60 opacity-75'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header with Icon, Category, Roadmap Stage & Difficulty */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-cyber-elevated border border-cyber-border flex items-center justify-center flex-shrink-0">
                      {getIcon(path.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted">
                          {path.category}
                        </span>
                        <span
                          className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border inline-flex items-center gap-1 ${
                            path.isMastered
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : path.isUnlocked
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {path.isMastered ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : !path.isUnlocked ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : null}
                          <span>{path.roadmapLevel}</span>
                        </span>
                        {isAdmin && !previewPlayerLock && !path.isPlayerUnlocked && (
                          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded border border-amber-500/35 bg-amber-500/10 text-amber-300 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Player Locked</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-cyber-text">
                        {path.title}
                      </h2>
                    </div>
                  </div>
                  <DifficultyBadge difficulty={path.difficulty} />
                </div>

                <p className="text-xs text-cyber-muted leading-relaxed font-sans">
                  {path.description}
                </p>

                {/* Global Standards & Authoritative References */}
                {path.references && path.references.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted/80 block">
                      Global Standards & Trusted References
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.references.map((ref: LearningPathReference) => {
                        const style = getReferenceBadgeStyle(ref.type);
                        return (
                          <span
                            key={ref.identifier}
                            title={`${ref.type}: ${ref.name}`}
                            className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${style}`}
                          >
                            <span className="font-bold opacity-90">[{ref.type}]</span>
                            <span>{ref.identifier}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Topics Tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted/80 block">
                    Curriculum Methodologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {path.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated border border-cyber-border/70 text-cyber-muted"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress and Actions */}
              <div className="space-y-3 pt-3 border-t border-cyber-border">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyber-muted">Curriculum Progress</span>
                    <span className="text-emerald-400 font-bold">{path.progressPercentage}%</span>
                  </div>
                  <Progress value={path.progressPercentage} className="h-1.5 bg-cyber-elevated" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cyber-muted pt-1">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {path.lessonsCount} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" /> {path.challengesCount} Labs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {path.estimatedHours}h
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {path.isUnlocked ? (
                      <>
                        <Link
                          to={`/knowledge?category=${encodeURIComponent(path.lessonsCategoryParam)}`}
                          className="inline-flex items-center gap-1 border border-cyber-border hover:border-slate-700 bg-cyber-card hover:bg-cyber-elevated text-cyber-text text-xs h-8 px-2.5 rounded-lg transition-colors font-mono"
                        >
                          <BookMarked className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          <span>Lessons</span>
                        </Link>

                        <Link
                          to={`/challenges?category=${encodeURIComponent(path.category)}`}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs h-8 px-3 rounded-lg shadow-md transition-colors"
                        >
                          <span>Practice Labs</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </>
                    ) : (
                      <span
                        title={`Complete ${path.blockingCategoryName} first to unlock`}
                        className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono text-[11px] h-8 px-3 rounded-lg cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3 text-zinc-500" />
                        <span>Complete {path.blockingCategoryName} first</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No learning paths found"
          description="Try adjusting your search query, OWASP tag, or level filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedDifficulty('All');
          }}
        />
      )}
    </div>
  );
};

export default LearningPathsPage;

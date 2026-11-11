import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockLearningPaths } from '@/data/mock/learningPaths';
import { apiClient } from '@/services/api';
import { LearningPathReference } from '@/types';

export const LearningPathsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [solvedChallenges, setSolvedChallenges] = useState<any[]>([]);

  useEffect(() => {
    apiClient
      .get('/challenges', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.items;
        if (Array.isArray(items)) {
          const solved = items.filter(
            (c: any) => c.userProgress?.status === 'SOLVED' || c.isSolved || c.solved
          );
          setSolvedChallenges(solved);
        }
      })
      .catch(() => {});
  }, []);

  const dynamicPaths = useMemo(() => {
    return mockLearningPaths.map((path) => {
      const matchingSolved = solvedChallenges.filter((c) => {
        const catName = (c.category?.name || c.category || '').toLowerCase();
        const pathCat = (path.targetCategory || path.category).toLowerCase();
        if (path.id === 'lp-01') {
          return (c.difficulty || '').toLowerCase() === 'beginner' || catName.includes('auth');
        }
        return catName.includes(pathCat) || pathCat.includes(catName);
      }).length;

      const totalLabs = path.challengesCount || 1;
      const progressPercentage = Math.min(
        Math.round((matchingSolved / totalLabs) * 100),
        100
      );

      return {
        ...path,
        completedLessons: matchingSolved,
        progressPercentage,
      };
    });
  }, [solvedChallenges]);

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

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Curated Learning Paths
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              12 Structured Roadmaps
            </span>
          </div>
          <p className="text-xs md:text-sm text-cyber-muted mt-1">
            Offensive security pathways grounded in global security standards (OWASP Top 10, WSTG v4.2, CWE, NIST SP 800, MITRE ATT&CK, IETF RFCs).
          </p>
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Pathways Grid */}
      {filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPaths.map((path) => (
            <div
              key={path.id}
              className="rounded-xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-3.5">
                {/* Header with Icon, Category & Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-cyber-elevated border border-cyber-border flex items-center justify-center flex-shrink-0">
                      {getIcon(path.iconName)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted block">
                        {path.category}
                      </span>
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
                    <Link
                      to={`/knowledge?category=${encodeURIComponent(path.category)}`}
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

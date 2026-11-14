import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Save,
  BookOpen,
  Layers,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeLessonListItem } from '@/types';
import {
  ROADMAP_NODES,
  findRoadmapNodeForCategory,
  getCanonicalDbCategory,
} from '@/constants/learningRoadmap';

export const ADMIN_CATEGORIES = [
  { slug: 'all', name: 'All Categories', dbValue: 'all', level: 'ALL' },
  { slug: 'foundations', name: 'Web Security Fundamentals', dbValue: 'Foundations', level: 'BASE' },
  ...ROADMAP_NODES.slice(0, 11).map((node) => ({
    slug: node.id,
    name: node.name,
    dbValue: node.dbCategory,
    level: node.level,
  })),
];

export const AdminKnowledgePage: React.FC = () => {
  const [lessons, setLessons] = useState<KnowledgeLessonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setIsLoading(true);
      const res: any = await knowledgeService.getLessons({ limit: 100 });
      const items = Array.isArray(res) ? res : (res?.items || res?.data?.items || []);
      setLessons(items);
    } catch (err: any) {
      console.error('Failed to load lessons for admin:', err);
      setMessage({ text: 'Failed to load lessons', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (lesson: KnowledgeLessonListItem) => {
    try {
      const full = await knowledgeService.getLessonBySlug(lesson.slug);
      setEditingLesson({
        ...full,
        category: getCanonicalDbCategory(full.category),
      });
    } catch (err: any) {
      console.error('Failed to load lesson for edit:', err);
      setMessage({ text: 'Failed to load lesson details', type: 'error' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLesson) return;
    try {
      setIsSaving(true);
      const parsedCvss =
        editingLesson.cvssScore === '' || editingLesson.cvssScore === null || editingLesson.cvssScore === undefined
          ? undefined
          : Number(editingLesson.cvssScore);
      await knowledgeService.updateLesson(editingLesson.id, {
        title: editingLesson.title,
        description: editingLesson.description,
        category: getCanonicalDbCategory(editingLesson.category),
        status: editingLesson.status,
        cvssScore: Number.isNaN(parsedCvss) ? undefined : parsedCvss,
        overview: editingLesson.overview,
        rootCause: editingLesson.rootCause,
        prevention: editingLesson.prevention,
        keyTakeaways: editingLesson.keyTakeaways,
      });
      setMessage({ text: 'Lesson updated successfully!', type: 'success' });
      setEditingLesson(null);
      loadLessons();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update lesson:', err);
      setMessage({ text: 'Failed to update lesson', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    try {
      await knowledgeService.deleteLesson(id);
      setMessage({ text: 'Lesson deleted successfully', type: 'success' });
      loadLessons();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete lesson:', err);
      setMessage({ text: 'Failed to delete lesson', type: 'error' });
    }
  };

  const matchesCategory = (lessonCategory: string, filterSlug: string) => {
    if (filterSlug === 'all') return true;
    const matchedNode = findRoadmapNodeForCategory(lessonCategory);
    if (matchedNode) return matchedNode.id === filterSlug;
    return (lessonCategory || '').toLowerCase() === filterSlug.toLowerCase();
  };

  const getCategoryCount = (filterSlug: string) => {
    if (filterSlug === 'all') return lessons.length;
    return lessons.filter((l) => matchesCategory(l.category, filterSlug)).length;
  };

  const filtered = lessons.filter((l) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      (l.owaspReference && l.owaspReference.toLowerCase().includes(q)) ||
      (l.cweReference && l.cweReference.toLowerCase().includes(q));
    const matchCat = matchesCategory(l.category, categoryFilter);
    return matchSearch && matchCat;
  });

  const publishedCount = lessons.filter((l) => l.status === 'PUBLISHED').length;
  const draftCount = lessons.length - publishedCount;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-[1720px] mx-auto animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-cyber-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
            <Shield className="w-3 h-3" />
            Admin Control Center
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight">
            Security Knowledge Management
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted mt-0.5 xl:whitespace-nowrap">
            Manage, audit, and publish all {lessons.length || 73} security lessons across Foundations and 11 sequential roadmap categories.
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-elevated text-cyber-text border border-cyber-border flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-emerald-400" />
              {lessons.length} Lessons Available
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-elevated text-cyber-text border border-cyber-border flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              11 Sequential Roadmap Levels
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              {publishedCount} Published
            </span>
            {draftCount > 0 && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                {draftCount} Draft / In-Review
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLessons}
            className="font-mono text-xs border-cyber-border bg-cyber-card hover:bg-cyber-elevated text-cyber-text gap-1.5 h-8"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Link to="/learning-progress">
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 gap-1.5 h-8"
            >
              <MapPin className="w-3.5 h-3.5" />
              View Roadmap
            </Button>
          </Link>
          <Link to="/knowledge">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs gap-1.5 shadow-md h-8">
              <ExternalLink className="w-3.5 h-3.5" />
              View Library
            </Button>
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl font-mono text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-400'
              : 'bg-rose-950/30 border border-rose-500/40 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <Input
            type="text"
            placeholder="Search lessons by title, CWE, or OWASP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-cyber-card border-cyber-border font-mono text-xs text-cyber-text placeholder:text-cyber-muted/60 h-9 rounded-lg"
          />
        </div>
        <div className="text-xs font-mono text-cyber-muted">
          Showing <strong className="text-emerald-400">{filtered.length}</strong> of {lessons.length} lessons
        </div>
      </div>

      {/* Category Pills Bar: Ordered sequentially matching the Student Learning Roadmap (LVL 1 → LVL 11) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {ADMIN_CATEGORIES.map((cat) => {
          const isSelected = categoryFilter === cat.slug;
          const count = getCategoryCount(cat.slug);
          const publishedInCat =
            cat.slug === 'all'
              ? publishedCount
              : lessons.filter((l) => matchesCategory(l.category, cat.slug) && l.status === 'PUBLISHED').length;
          const hasNoPublished = cat.slug !== 'all' && lessons.length > 0 && publishedInCat === 0;

          return (
            <button
              key={cat.slug}
              onClick={() => setCategoryFilter(cat.slug)}
              title={
                cat.slug === 'all'
                  ? 'Show all categories'
                  : `${cat.level} in Student Roadmap (${publishedInCat}/${count} published)`
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 select-none cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : hasNoPublished
                  ? 'bg-amber-950/30 text-amber-300 border border-amber-500/40 hover:bg-amber-950/50 font-medium'
                  : 'bg-cyber-card text-cyber-muted border border-cyber-border hover:border-slate-700 hover:text-cyber-text hover:bg-cyber-elevated font-medium'
              }`}
            >
              {cat.level !== 'ALL' && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded font-extrabold ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {cat.level}
                </span>
              )}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-slate-950/25 text-slate-950 font-extrabold'
                    : 'bg-slate-900/80 text-cyber-muted border border-cyber-border/40'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-cyber-card border border-cyber-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-cyber-elevated/70 border-b border-cyber-border text-cyber-muted uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3.5">Title & Slug</th>
                <th className="py-2.5 px-3.5">Roadmap Stage</th>
                <th className="py-2.5 px-3.5">Difficulty</th>
                <th className="py-2.5 px-3.5">Standards</th>
                <th className="py-2.5 px-3.5">Linked Challenge</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60 font-mono text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-cyber-muted">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-emerald-400" />
                    Loading security knowledge catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-cyber-muted">
                    No matching lessons found in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stageNode = findRoadmapNodeForCategory(item.category);
                  return (
                  <tr key={item.id} className="hover:bg-cyber-elevated/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-cyber-text max-w-xs truncate">
                      <div>{item.title}</div>
                      <div className="text-[10px] font-normal text-cyber-muted truncate">{item.slug}</div>
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-muted">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyber-elevated border border-cyber-border/50 text-cyber-text text-[10px]">
                        {stageNode ? (
                          <>
                            <span className="text-emerald-400 font-bold">{stageNode.level}</span>
                            <span>{stageNode.name}</span>
                          </>
                        ) : item.category.toLowerCase() === 'foundations' ? (
                          <>
                            <span className="text-cyan-400 font-bold">BASE</span>
                            <span>Web Security Fundamentals</span>
                          </>
                        ) : (
                          <span>{item.category}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <DifficultyBadge difficulty={item.difficulty as any} />
                    </td>
                    <td className="py-2.5 px-3.5 space-y-0.5">
                      {item.owaspReference && (
                        <div className="text-[10px] text-cyan-400 font-bold">{item.owaspReference}</div>
                      )}
                      {item.cweReference && (
                        <div className="text-[10px] text-amber-400 font-mono">{item.cweReference.split(':')[0]}</div>
                      )}
                      {item.cvssScore && (
                        <div className="text-[10px] text-rose-400 font-bold">CVSS {item.cvssScore}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-text">
                      <Link
                        to={`/challenges/${item.challenge.slug}`}
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>{item.challenge.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </Link>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyber-elevated text-cyber-muted border border-cyber-border'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link to={`/knowledge/${item.slug}`} target="_blank">
                          <button
                            title="Preview lesson in viewer"
                            className="p-1 rounded hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-text"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          title="Edit Lesson"
                          onClick={() => handleEditClick(item)}
                          className="p-1 rounded hover:bg-cyber-elevated text-cyan-400 hover:text-cyan-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Lesson"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded hover:bg-cyber-elevated text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="font-mono font-bold text-lg text-cyber-text flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                Edit Lesson: {editingLesson.title}
              </h3>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-1.5 rounded-lg hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-cyber-muted block mb-1">Title</label>
                  <Input
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="bg-cyber-elevated border-cyber-border text-xs text-cyber-text"
                  />
                </div>
                <div>
                  <label className="text-cyber-muted block mb-1">Status</label>
                  <select
                    value={editingLesson.status}
                    onChange={(e) => setEditingLesson({ ...editingLesson, status: e.target.value })}
                    className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">Roadmap Category</label>
                <select
                  value={editingLesson.category}
                  onChange={(e) => setEditingLesson({ ...editingLesson, category: e.target.value })}
                  className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                >
                  {ADMIN_CATEGORIES.filter((c) => c.slug !== 'all').map((c) => (
                    <option key={c.slug} value={c.dbValue}>
                      {c.level} · {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                />
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">Overview</label>
                <textarea
                  rows={4}
                  value={editingLesson.overview}
                  onChange={(e) => setEditingLesson({ ...editingLesson, overview: e.target.value })}
                  className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                />
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">Root Cause Explanation</label>
                <textarea
                  rows={3}
                  value={editingLesson.rootCause}
                  onChange={(e) => setEditingLesson({ ...editingLesson, rootCause: e.target.value })}
                  className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                />
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">Prevention & Mitigation</label>
                <textarea
                  rows={3}
                  value={editingLesson.prevention}
                  onChange={(e) => setEditingLesson({ ...editingLesson, prevention: e.target.value })}
                  className="w-full bg-cyber-elevated border border-cyber-border rounded-md p-2 text-cyber-text text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingLesson(null)}
                className="font-mono text-xs border-cyber-border bg-cyber-card hover:bg-cyber-elevated text-cyber-text"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs gap-1.5 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKnowledgePage;

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Shield,
  ExternalLink,
  Search,
  AlertTriangle,
  Server,
  Key,
  Cpu,
  Layers,
  Code2,
  Flag,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Info,
  Terminal,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  SECURITY_FRAMEWORKS,
  FOUNDATIONS_CHEAT_SHEET,
  SecurityFramework,
} from '@/data/docsData';

type DocsTab = 'all' | 'owasp' | 'methodology' | 'roe' | 'platform';

const CATEGORY_THEME: Record<
  SecurityFramework['category'],
  {
    label: string;
    badge: string;
    accentLine: string;
    hoverBorder: string;
    pillText: string;
  }
> = {
  owasp: {
    label: 'OWASP Standard',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    accentLine: 'from-emerald-500/60 via-emerald-400/20 to-transparent',
    hoverBorder: 'hover:border-emerald-500/45',
    pillText: 'text-emerald-400',
  },
  taxonomy: {
    label: 'Taxonomy & Scoring',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    accentLine: 'from-sky-500/60 via-cyan-400/20 to-transparent',
    hoverBorder: 'hover:border-sky-500/45',
    pillText: 'text-sky-400',
  },
  methodology: {
    label: 'Testing Methodology',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    accentLine: 'from-amber-500/60 via-orange-400/20 to-transparent',
    hoverBorder: 'hover:border-amber-500/45',
    pillText: 'text-amber-400',
  },
};

export const DocsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DocsTab>('all');
  const [selectedFramework, setSelectedFramework] =
    useState<SecurityFramework | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const owaspCount = useMemo(
    () => SECURITY_FRAMEWORKS.filter((fw) => fw.category === 'owasp').length,
    [],
  );
  const methodologyCount = useMemo(
    () =>
      SECURITY_FRAMEWORKS.filter(
        (fw) => fw.category === 'methodology' || fw.category === 'taxonomy',
      ).length,
    [],
  );

  // Allow Escape key to close the framework breakdown modal
  useEffect(() => {
    if (!selectedFramework) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedFramework(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFramework]);

  const filteredFrameworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SECURITY_FRAMEWORKS.filter((fw) => {
      const matchesSearch =
        !q ||
        fw.title.toLowerCase().includes(q) ||
        fw.code.toLowerCase().includes(q) ||
        fw.summary.toLowerCase().includes(q) ||
        fw.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        fw.keyCategories.some(
          (cat) =>
            cat.id.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q),
        );

      if (!matchesSearch) return false;
      if (activeTab === 'owasp') return fw.category === 'owasp';
      if (activeTab === 'methodology') {
        return fw.category === 'methodology' || fw.category === 'taxonomy';
      }
      return true;
    });
  }, [searchQuery, activeTab]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() && (activeTab === 'roe' || activeTab === 'platform')) {
      setActiveTab('all');
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery((prev) =>
      prev.toLowerCase() === tag.toLowerCase() ? '' : tag,
    );
    if (activeTab === 'roe' || activeTab === 'platform') {
      setActiveTab('all');
    }
  };

  const handleCopyCommand = async (slug: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedSlug(slug);
      setTimeout(() => {
        setCopiedSlug((prev) => (prev === slug ? null : prev));
      }, 1800);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  };

  const showFrameworksSection =
    activeTab === 'all' || activeTab === 'owasp' || activeTab === 'methodology';

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-6 pb-16 font-sans animate-fade-in">
      {/* ==================================================================== */}
      {/* HERO HEADER BANNER                                                   */}
      {/* ==================================================================== */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/45 via-zinc-900/75 to-cyan-950/40 border border-emerald-500/20 p-6 md:p-7 overflow-hidden backdrop-blur-sm">
        <div
          className="absolute -right-8 -bottom-10 opacity-[0.07] pointer-events-none select-none"
          aria-hidden="true"
        >
          <BookOpen className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                <Sparkles className="w-3 h-3" />
                // Platform Knowledge Base
              </span>
              <span className="text-[11px] font-mono text-cyber-muted uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyber-elevated/70 border border-cyber-border">
                Standards &amp; Operational Manual
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                  <Shield className="w-3 h-3" />
                  Admin Operator Reference
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-cyber-text tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-emerald-400 shrink-0 hidden sm:block" />
              <span>Documentation &amp; Security Frameworks</span>
            </h1>

            <p className="text-sm text-cyber-muted leading-relaxed max-w-2xl">
              Authoritative industry standards, vulnerability taxonomies,
              testing methodologies, flag capture mechanics, and operational rules
              of engagement for WebSec CTF.
            </p>
          </div>

          {/* Right Telemetry & Quick Navigation Card */}
          <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 shrink-0">
            <div className="grid grid-cols-3 bg-zinc-950/75 border border-zinc-800/90 rounded-xl px-4 py-3 shadow-sm">
              <div className="text-center pr-4 border-r border-zinc-800">
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {SECURITY_FRAMEWORKS.length}
                </div>
                <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                  Frameworks
                </div>
              </div>
              <div className="text-center px-4 border-r border-zinc-800">
                <div className="text-xl font-bold font-mono text-sky-400">
                  100%
                </div>
                <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                  Official Specs
                </div>
              </div>
              <div className="text-center pl-4">
                <div className="text-xl font-bold font-mono text-amber-400">
                  v2.4
                </div>
                <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                  CTF Standard
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/learning-paths"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-cyber-text bg-cyber-card hover:bg-cyber-elevated border border-cyber-border transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Learning Paths</span>
              </Link>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Practice Labs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* UNIFIED NAVIGATION TABS & LIVE SEARCH BAR                            */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-cyber-card/70 border border-cyber-border rounded-xl p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
            }`}
          >
            <span>All References</span>
            <span className="text-[10px] opacity-75">
              ({SECURITY_FRAMEWORKS.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('owasp')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'owasp'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
            }`}
          >
            <span>OWASP Standards</span>
            <span className="text-[10px] opacity-75">({owaspCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('methodology')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'methodology'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
            }`}
          >
            <span>Methodologies &amp; Taxonomies</span>
            <span className="text-[10px] opacity-75">({methodologyCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roe')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roe'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Rules of Engagement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('platform')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'platform'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 font-bold shadow-sm'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated border border-transparent'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Architecture &amp; Flag Guide</span>
          </button>
        </div>

        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search framework, CWE, OWASP, CVSS..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-zinc-950/70 border border-cyber-border rounded-lg text-cyber-text placeholder:text-cyber-muted/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION: SECURITY FRAMEWORKS & OFFICIAL REFERENCES                   */}
      {/* ==================================================================== */}
      {showFrameworksSection && (
        <section aria-labelledby="frameworks-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="frameworks-heading"
              className="text-base font-bold text-cyber-text flex items-center gap-2 font-mono uppercase tracking-wider"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Security Framework References &amp; Taxonomies</span>
              <span className="text-xs font-normal text-cyber-muted lowercase">
                ({filteredFrameworks.length} of {SECURITY_FRAMEWORKS.length}{' '}
                specifications)
              </span>
            </h2>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear filter &quot;{searchQuery}&quot;</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFrameworks.map((fw) => {
              const theme = CATEGORY_THEME[fw.category];
              return (
                <article
                  key={fw.code}
                  className={`relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-4 ${theme.hoverBorder} transition-all shadow-md group`}
                >
                  {/* Subtle top category hairline accent */}
                  <div
                    className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${theme.accentLine}`}
                    aria-hidden="true"
                  />

                  <div className="space-y-3">
                    {/* Top Metadata Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono px-2.5 py-0.5 rounded border font-bold ${theme.badge}`}
                        >
                          {fw.code}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted">
                          {theme.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-cyber-muted">
                        <span className="px-2 py-0.5 rounded bg-cyber-elevated/80 border border-cyber-border/70">
                          {fw.keyCategories.length} domains
                        </span>
                        <span>{fw.version}</span>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h3 className="text-base font-bold text-cyber-text group-hover:text-emerald-300 transition-colors">
                        {fw.title}
                      </h3>
                      <p className="text-xs text-cyber-muted leading-relaxed mt-1.5">
                        {fw.summary}
                      </p>
                    </div>

                    {/* Clickable Filter Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {fw.tags.map((tag) => {
                        const isActiveTag =
                          searchQuery.toLowerCase() === tag.toLowerCase();
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                              isActiveTag
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-cyber-elevated/80 text-slate-300 border-cyber-border/80 hover:border-emerald-500/35 hover:text-emerald-300'
                            }`}
                            title={`Filter by ${tag}`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* CTF Alignment Callout */}
                    <div className="text-[11.5px] text-cyber-muted bg-cyber-elevated/50 p-3 rounded-lg border border-cyber-border/60 flex items-start gap-2.5">
                      <Terminal
                        className={`w-3.5 h-3.5 ${theme.pillText} mt-0.5 shrink-0`}
                      />
                      <span className="leading-relaxed">{fw.ctfRelevance}</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-cyber-border/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFramework(fw)}
                      className="text-xs font-mono font-semibold text-cyber-text hover:text-emerald-400 transition-colors inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyber-elevated/60 hover:bg-cyber-elevated border border-cyber-border/70"
                    >
                      <span>Inspect Domains</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-3">
                      {fw.repoUrl && (
                        <a
                          href={fw.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                          title="GitHub / Project Source"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={fw.specUrl || fw.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/15 px-2.5 py-1.5 rounded-lg border border-emerald-500/25 transition-colors"
                      >
                        <span>Official Spec</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredFrameworks.length === 0 && (
            <div className="rounded-xl border border-dashed border-cyber-border bg-cyber-card/40 p-10 text-center space-y-2">
              <p className="text-cyber-text text-sm font-mono font-semibold">
                No security framework matches &quot;{searchQuery}&quot;
              </p>
              <p className="text-cyber-muted text-xs font-mono">
                Try searching for &quot;OWASP&quot;, &quot;SQL&quot;,
                &quot;API&quot;, &quot;CWE&quot;, or &quot;SSRF&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* SECTION: RULES OF ENGAGEMENT (ROE)                                   */}
      {/* ==================================================================== */}
      {(activeTab === 'all' || activeTab === 'roe') && (
        <section aria-labelledby="roe-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="roe-heading"
              className="text-base font-bold text-cyber-text flex items-center gap-2 font-mono uppercase tracking-wider"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Platform Rules of Engagement (ROE)</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              MANDATORY PROTOCOL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Rule 1 */}
            <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3 hover:border-emerald-500/35 transition-colors">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/70 to-transparent" />
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-emerald-400 font-bold text-xs font-mono leading-snug">
                  1. AUTHORIZED TARGETS &amp; ISOLATION
                </span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Testing is strictly authorized{' '}
                <strong className="text-cyber-text">
                  only against your designated challenge targets
                </strong>
                . Each environment runs in an isolated sandbox—never target
                other players&apos; sessions or containers.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="relative overflow-hidden rounded-xl border border-red-500/25 bg-red-950/10 p-5 space-y-3 hover:border-red-500/45 transition-colors">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-500/80 to-transparent" />
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-red-400 font-bold text-xs font-mono leading-snug">
                  2. OUT-OF-BOUNDS INFRASTRUCTURE
                </span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Attacking core platform services (
                <code className="text-red-300 font-mono">Backend :3000</code>,{' '}
                <code className="text-red-300 font-mono">MySQL</code>,{' '}
                <code className="text-red-300 font-mono">Redis</code>, or
                Docker daemon) is strictly prohibited and triggers automated
                disqualification.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3 hover:border-sky-500/35 transition-colors">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-500/70 to-transparent" />
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-sky-400 font-bold text-xs font-mono leading-snug">
                  3. DYNAMIC FLAG INTEGRITY
                </span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Flags use per-player cryptographic binding (
                <code className="text-sky-300 font-mono">websec&#123;...&#125;</code>
                ). Sharing plaintext flags bypasses learning and fails
                validation; discuss techniques, never trade flags.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="relative overflow-hidden rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3 hover:border-amber-500/35 transition-colors">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500/70 to-transparent" />
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-amber-400 font-bold text-xs font-mono leading-snug">
                  4. RATE &amp; FUZZING LIMITS
                </span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Volumetric DoS floods and aggressive scanners (&gt; 50 req/sec)
                are blocked. Every lab is designed for targeted manual or
                precision scripted exploitation—never bandwidth brute force.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* SECTION: PLATFORM ARCHITECTURE & PRACTICAL FLAG FIELD GUIDE          */}
      {/* ==================================================================== */}
      {(activeTab === 'all' || activeTab === 'platform') && (
        <section aria-labelledby="platform-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="platform-heading"
              className="text-base font-bold text-cyber-text flex items-center gap-2 font-mono uppercase tracking-wider"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>CTF Platform Architecture &amp; Game Mechanics</span>
            </h2>
            <span className="text-[11px] font-mono text-cyber-muted">
              12 Categories • 73 Live Challenges
            </span>
          </div>

          {/* 3 Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-xs font-bold">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/25">
                    <Flag className="w-4 h-4" />
                  </div>
                  <span>Flag Standard</span>
                </div>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  Flags follow{' '}
                  <code className="text-emerald-400 font-mono font-bold bg-cyber-elevated px-1.5 py-0.5 rounded">
                    websec&#123;...&#125;
                  </code>{' '}
                  (or{' '}
                  <code className="text-emerald-300 font-mono">
                    WEBSEC&#123;...&#125;
                  </code>
                  ). Dynamic labs bind each capture to the operator&apos;s
                  active session token.
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyber-muted bg-cyber-elevated/60 px-3 py-2 rounded-lg border border-cyber-border/50">
                Pattern:{' '}
                <span className="text-emerald-300">
                  websec&#123;[a-z0-9_]+&#125;
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sky-400 font-mono text-xs font-bold">
                  <div className="p-1.5 rounded-md bg-sky-500/10 border border-sky-500/25">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span>Container Isolation</span>
                </div>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  Isolated lab environments enforce non-root privileges,
                  read-only root filesystems, CPU quotas (0.5 vCPU), and memory
                  caps (256MB).
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyber-muted bg-cyber-elevated/60 px-3 py-2 rounded-lg border border-cyber-border/50">
                Instance TTL:{' '}
                <span className="text-sky-300">60-minute auto-expiry</span>
              </div>
            </div>

            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-amber-400 font-mono text-xs font-bold">
                  <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/25">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span>Scoring &amp; Hint Penalties</span>
                </div>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  Challenges award dynamic points based on difficulty and solve
                  decay. Three progressive hint tiers unlock guidance cleanly.
                </p>
              </div>
              <div className="text-[11px] font-mono text-amber-300/90 bg-cyber-elevated/60 px-3 py-2 rounded-lg border border-cyber-border/50">
                Tier 1 (Free) • Tier 2 (-15%) • Tier 3 (-40%)
              </div>
            </div>
          </div>

          {/* Practical Flag Field Guide */}
          <div className="rounded-xl border border-emerald-500/25 bg-cyber-card p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  <span>
                    How to Find Flags — 4-Step Penetration Testing Workflow
                  </span>
                </div>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  Target endpoints live under{' '}
                  <code className="text-emerald-300 font-mono bg-cyber-elevated px-1.5 py-0.5 rounded">
                    /api/v1/targets/:username/:slug/...
                  </code>{' '}
                  or shorthand{' '}
                  <code className="text-emerald-300 font-mono bg-cyber-elevated px-1.5 py-0.5 rounded">
                    /api/v1/targets/:slug/...
                  </code>
                  . Flags are returned inside HTTP response headers, JSON
                  payloads, DOM responses, or query results.
                </p>
              </div>

              <Link
                to="/challenges?category=Foundations"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors shrink-0 w-fit"
              >
                <span>Open Fundamentals Labs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 text-xs">
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/45 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400 text-[11px]">
                    01. INSPECT HEADERS &amp; COOKIES
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/70 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    Recon
                  </span>
                </div>
                <p className="text-[11.5px] text-cyber-muted leading-relaxed">
                  Use DevTools (
                  <kbd className="px-1 py-0.5 bg-cyber-card border border-cyber-border rounded text-[10px]">
                    F12
                  </kbd>{' '}
                  → Network) or <code className="text-cyan-300 font-mono">curl -i</code>. Body-only output misses flags in{' '}
                  <code className="text-cyan-300 font-mono">
                    X-Foundations-Trace
                  </code>{' '}
                  or <code className="text-cyan-300 font-mono">Set-Cookie</code>.
                </p>
              </div>

              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/45 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-[11px]">
                    02. PROBE VERBS &amp; PREFLIGHT
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Enum
                  </span>
                </div>
                <p className="text-[11.5px] text-cyber-muted leading-relaxed">
                  Send <code className="text-amber-300 font-mono">OPTIONS</code>{' '}
                  to reveal <code className="text-amber-300 font-mono">Allow</code>{' '}
                  methods, then test state-changing verbs (
                  <code className="text-amber-300 font-mono">PUT</code> /{' '}
                  <code className="text-amber-300 font-mono">POST</code>) or
                  cross-origin <code className="text-amber-300 font-mono">Origin</code>{' '}
                  headers.
                </p>
              </div>

              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/45 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-violet-400 text-[11px]">
                    03. INTERCEPT &amp; TAMPER
                  </span>
                  <span className="text-[10px] font-mono text-violet-400/70 bg-violet-500/10 px-1.5 py-0.5 rounded">
                    Exploit
                  </span>
                </div>
                <p className="text-[11.5px] text-cyber-muted leading-relaxed">
                  Client UI controls never enforce trust. Replay requests in Burp
                  Repeater or <code className="text-violet-300 font-mono">curl -X POST</code>{' '}
                  modifying prices, roles, JWT claims, or object IDs.
                </p>
              </div>

              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/45 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">
                    04. VERIFY &amp; SUBMIT FLAG
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Capture
                  </span>
                </div>
                <p className="text-[11.5px] text-cyber-muted leading-relaxed">
                  Once your probe triggers the vulnerable path or validates a
                  hardened control (SOP, STRIDE, ASVS), copy the{' '}
                  <code className="text-emerald-300 font-mono">
                    WEBSEC&#123;...&#125;
                  </code>{' '}
                  token into Challenge Workspace.
                </p>
              </div>
            </div>

            {/* Collapsible Web Security Fundamentals Target Cheat Sheet */}
            <div className="rounded-lg border border-cyber-border bg-zinc-950/55 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCheatSheet((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-cyber-elevated/40 transition-colors"
                aria-expanded={showCheatSheet}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Web Security Fundamentals — 10 Target Probe Commands
                  </span>
                  <span className="text-[10px] font-mono text-cyber-muted px-2 py-0.5 rounded bg-cyber-elevated border border-cyber-border">
                    Copy-ready curl snippets
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-mono text-cyber-muted">
                  <span>{showCheatSheet ? 'Hide' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showCheatSheet ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {showCheatSheet && (
                <div className="border-t border-cyber-border/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                    {FOUNDATIONS_CHEAT_SHEET.map((item) => {
                      const isCopied = copiedSlug === item.slug;
                      return (
                        <div
                          key={item.slug}
                          className="rounded-lg border border-cyber-border/80 bg-cyber-card/70 p-3 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                                {item.method}
                              </span>
                              <span className="text-cyber-text font-semibold truncate">
                                {item.slug}
                              </span>
                            </div>
                            <div className="text-[11px] text-cyber-muted">
                              {item.hint}
                            </div>
                            <code className="block text-[10.5px] font-mono text-emerald-300/90 bg-zinc-950/80 px-2 py-1 rounded border border-cyber-border/50 truncate">
                              {item.command}
                            </code>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCommand(item.slug, item.command)
                            }
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-mono bg-cyber-elevated hover:bg-emerald-500/15 text-cyber-text hover:text-emerald-300 border border-cyber-border transition-colors"
                            title="Copy curl command"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {isAdmin && (
                    <div className="text-[11px] font-mono text-purple-300/90 bg-purple-500/10 border border-purple-500/25 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                      <span>
                        Admin Walkthrough Reference: full lab verification
                        notes are stored locally in{' '}
                        <code className="text-purple-200">
                          docs/CHALLENGE_SOLUTIONS_WALKTHROUGH.md
                        </code>{' '}
                        (excluded from public git).
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* DETAILED FRAMEWORK BREAKDOWN MODAL                                   */}
      {/* ==================================================================== */}
      {selectedFramework && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setSelectedFramework(null)}
        >
          <div
            className="bg-cyber-card border border-cyber-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-cyber-border flex items-start justify-between gap-3 bg-cyber-elevated/40">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      CATEGORY_THEME[selectedFramework.category].badge
                    }`}
                  >
                    {selectedFramework.code}
                  </span>
                  <span className="text-xs font-mono text-cyber-muted">
                    {selectedFramework.version}
                  </span>
                </div>
                <h3
                  id="modal-title"
                  className="text-lg font-bold text-cyber-text"
                >
                  {selectedFramework.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="text-cyber-muted hover:text-white p-1.5 rounded-lg hover:bg-cyber-elevated transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              <div>
                <h4 className="text-xs font-bold text-cyber-text font-mono uppercase tracking-wider mb-1.5">
                  Overview &amp; Scope
                </h4>
                <p className="text-cyber-muted leading-relaxed">
                  {selectedFramework.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-cyber-text font-mono uppercase tracking-wider mb-2">
                  Key Categories &amp; Vulnerability Focus
                </h4>
                <div className="space-y-2">
                  {selectedFramework.keyCategories.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-cyber-elevated/70 border border-cyber-border/70 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3"
                    >
                      <span className="font-mono text-emerald-400 font-bold whitespace-nowrap text-[11px] min-w-[92px]">
                        {item.id}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-cyber-text">
                          {item.name}:{' '}
                        </span>
                        <span className="text-cyber-muted">{item.focus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-950/25 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">
                    WebSec CTF Alignment:{' '}
                  </strong>
                  {selectedFramework.ctfRelevance}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cyber-border bg-cyber-elevated/30 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors"
              >
                Close (Esc)
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={selectedFramework.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-cyber-elevated transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Project Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={selectedFramework.specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Official Spec</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ATTRIBUTION FOOTER                                                   */}
      {/* ==================================================================== */}
      <div className="pt-6 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-cyber-muted">
        <div>
          WebSec CTF — Designed &amp; Architected by{' '}
          <span className="text-emerald-400 font-bold">SEK Thorn</span>
        </div>
        <div className="text-[11px] text-cyber-muted/70">
          Standards compliant with OWASP, MITRE ATT&amp;CK, NIST SP 800-115, and
          PTES.
        </div>
      </div>
    </div>
  );
};

export default DocsPage;

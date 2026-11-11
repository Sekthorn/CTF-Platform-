import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronLeft,
  Shield,
  ShieldAlert,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  FileCode2,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeLessonDetail } from '@/types';

export const LessonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();

  const [lesson, setLesson] = useState<KnowledgeLessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadLesson(slug);
    }
  }, [slug]);

  const loadLesson = async (lessonSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await knowledgeService.getLessonBySlug(lessonSlug);
      const data = res?.data || res;
      setLesson(data);
    } catch (err: any) {
      console.error('Failed to fetch lesson detail:', err);
      setError('Unable to load this security lesson. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;
    try {
      setIsMarkingComplete(true);
      await knowledgeService.completeLesson(lesson.id);
      setLesson((prev) => (prev ? { ...prev, isCompleted: true } : prev));
    } catch (err: any) {
      console.error('Failed to mark lesson completed:', err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Deciphering security lesson dossier...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-mono font-bold text-zinc-100">Lesson Not Found</h2>
        <p className="text-zinc-400 text-sm">{error || 'The requested lesson does not exist.'}</p>
        <Link to="/knowledge">
          <Button variant="outline" className="font-mono text-xs gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Knowledge Library
          </Button>
        </Link>
      </div>
    );
  }

  const isUnlocked = isAdmin || lesson.isUnlocked;

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-6 animate-fade-in pb-12 font-sans">
      {/* Top Breadcrumbs & Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Security Knowledge Library</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin/knowledge">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/10 gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Knowledge Admin
              </Button>
            </Link>
          )}

          {lesson.challenge && (
            <Link to={`/challenges/${lesson.challenge.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-200 gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Practice Challenge ({lesson.challenge.points} pts)
              </Button>
            </Link>
          )}

          {isUnlocked && (
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={lesson.isCompleted || isMarkingComplete}
              className={`font-mono text-xs gap-1.5 ${
                lesson.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lesson.isCompleted ? 'Completed' : 'Mark as Completed'}
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={lesson.difficulty as any} />

          <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
            {lesson.category}
          </span>

          {lesson.cvssScore && (
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
              CVSS {lesson.cvssScore}
            </span>
          )}

          <div className="ml-auto">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Admin Master Access
              </span>
            ) : isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                <Unlock className="w-3.5 h-3.5" />
                Dossier Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                <Lock className="w-3.5 h-3.5" />
                Challenge Locked
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-mono font-bold text-zinc-100">
          {lesson.title}
        </h1>

        <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-3xl">
          {lesson.description}
        </p>

        {/* References Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
          {lesson.owaspReference && (
            <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
              <span className="text-zinc-500 mr-1.5">OWASP:</span>
              <span className="text-zinc-200">{lesson.owaspReference}</span>
            </div>
          )}
          {lesson.cweReference && (
            <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
              <span className="text-zinc-500 mr-1.5">CWE:</span>
              <span className="text-zinc-200">{lesson.cweReference}</span>
            </div>
          )}
        </div>
      </div>

      {/* LOCKED BANNER (if user has not solved the challenge yet) */}
      {!isUnlocked && (
        <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-6 md:p-8 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-lg font-mono font-bold text-amber-300">
              Solution Protected by CTF Protocol
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              To preserve the integrity of the capture-the-flag arena, deep-dive root cause analysis,
              attack walkthroughs, and code remediations are locked until you successfully capture this
              challenge's flag.
            </p>
          </div>
          {lesson.challenge && (
            <div className="pt-2">
              <Link to={`/challenges/${lesson.challenge.slug}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold font-mono text-xs gap-2">
                  <Terminal className="w-4 h-4" />
                  Solve Challenge in CTF Arena
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 1. VULNERABILITY OVERVIEW */}
      <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
          <BookOpen className="w-4 h-4" />
          <h2>1. Vulnerability Overview</h2>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {lesson.overview}
        </p>
      </section>

      {/* UNLOCKED FULL CONTENT SECTIONS */}
      {isUnlocked && (
        <>
          {/* 2. ROOT CAUSE — WHY DOES THIS HAPPEN? */}
          <section className="rounded-xl bg-gradient-to-r from-amber-950/20 via-zinc-900/60 to-zinc-900/60 border border-amber-500/20 p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <h2>2. Root Cause — Why Does This Vulnerability Happen?</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.rootCause}
            </p>
          </section>

          {/* 3. HOW THE VULNERABILITY WORKS */}
          <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold">
              <Lightbulb className="w-4 h-4" />
              <h2>3. How the Vulnerability Works (Technical Mechanics)</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.mechanics}
            </p>
          </section>

          {/* 4. PRACTICAL ATTACK SCENARIO */}
          <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-semibold">
                <Terminal className="w-4 h-4" />
                <h2>4. Practical Attack Scenario</h2>
              </div>
              {lesson.attackScenario && (
                <button
                  onClick={() => copyToClipboard(lesson.attackScenario!, 'attack')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                >
                  {copiedSection === 'attack' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'attack' ? 'Copied' : 'Copy Payload'}
                </button>
              )}
            </div>
            <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
              {lesson.attackScenario}
            </div>
          </section>

          {/* 5. SECURITY IMPACT */}
          <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-mono text-sm font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <h2>5. Security Impact (Confidentiality, Integrity, Availability)</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.securityImpact}
            </p>
          </section>

          {/* 6. PREVENTION & MITIGATION */}
          <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
              <Shield className="w-4 h-4" />
              <h2>6. Prevention and Mitigation (Secure Coding Controls)</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.prevention}
            </p>
          </section>

          {/* 7. VULNERABLE CODE VS SECURE CODE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-mono text-sm font-semibold">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <h2>7. Code Comparison: Vulnerable vs Remediated Implementation</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vulnerable Code Box */}
              <div className="rounded-xl bg-zinc-900/60 border border-rose-500/30 overflow-hidden flex flex-col justify-between">
                <div className="bg-rose-950/30 px-4 py-2.5 border-b border-rose-500/20 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Vulnerable Implementation
                  </span>
                  {lesson.vulnerableCode && (
                    <button
                      onClick={() => copyToClipboard(lesson.vulnerableCode!, 'vulnCode')}
                      className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
                    >
                      {copiedSection === 'vulnCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="p-4 bg-zinc-950 font-mono text-xs text-rose-200/90 overflow-x-auto whitespace-pre leading-relaxed flex-1">
                  {lesson.vulnerableCode}
                </div>
              </div>

              {/* Secure Code Box */}
              <div className="rounded-xl bg-zinc-900/60 border border-emerald-500/30 overflow-hidden flex flex-col justify-between">
                <div className="bg-emerald-950/30 px-4 py-2.5 border-b border-emerald-500/20 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Remediated Secure Code
                  </span>
                  {lesson.secureCode && (
                    <button
                      onClick={() => copyToClipboard(lesson.secureCode!, 'secCode')}
                      className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
                    >
                      {copiedSection === 'secCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="p-4 bg-zinc-950 font-mono text-xs text-emerald-200/90 overflow-x-auto whitespace-pre leading-relaxed flex-1">
                  {lesson.secureCode}
                </div>
              </div>
            </div>
          </section>

          {/* 8. REAL-WORLD APPLICATION */}
          <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold">
              <Share2 className="w-4 h-4" />
              <h2>8. Real-World Application & Industry Incident Context</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.realWorldExample}
            </p>
          </section>
        </>
      )}

      {/* 9. ADDITIONAL LEARNING RESOURCES */}
      <section className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
          <ExternalLink className="w-4 h-4" />
          <h2>9. Verified Standards & References</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {lesson.references && lesson.references.length > 0 ? (
            lesson.references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 transition-colors"
              >
                <span className="font-mono text-xs text-zinc-300 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {ref.title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-2" />
              </a>
            ))
          ) : (
            <p className="text-xs text-zinc-500 font-mono">No external links cataloged.</p>
          )}
        </div>
      </section>

      {/* 10. KEY TAKEAWAYS */}
      <section className="rounded-xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/60 to-zinc-900/60 border border-emerald-500/20 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <h2>10. Key Takeaways</h2>
        </div>
        <div className="font-mono text-xs text-zinc-300 space-y-1.5 leading-relaxed whitespace-pre-line">
          {lesson.keyTakeaways}
        </div>
      </section>

      {/* Footer Navigation CTA */}
      <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/knowledge">
          <Button variant="outline" className="font-mono text-xs gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Library
          </Button>
        </Link>

        {isUnlocked && (
          <Button
            onClick={handleMarkComplete}
            disabled={lesson.isCompleted || isMarkingComplete}
            className={`font-mono text-xs gap-2 ${
              lesson.isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {lesson.isCompleted ? 'Lesson Completed ✓' : 'Mark as Completed'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonDetailPage;

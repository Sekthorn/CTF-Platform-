import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Sparkles,
  BookOpen,
  ArrowRight,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from './button';

interface SolveCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  pointsAwarded: number;
  category?: string;
  unlockedLesson?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export const SolveCelebrationModal: React.FC<SolveCelebrationModalProps> = ({
  isOpen,
  onClose,
  challengeTitle,
  pointsAwarded,
  category,
  unlockedLesson,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categoryLabel =
    typeof category === 'object' && category !== null
      ? (category as any).name
      : category;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Celebratory Dialog Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 z-10 space-y-6 text-center animate-in zoom-in-95 duration-200 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          title="Close dialog (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Trophy Aura */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Glowing pulse rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="absolute -inset-2 rounded-full border border-emerald-500/30 animate-spin" style={{ animationDuration: '8s' }} />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-zinc-900 border border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="w-10 h-10 text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs tracking-wider uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Challenge Solved</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Flag Verified & Accepted!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans">
            You successfully exploited and captured the flag for{' '}
            <span className="text-emerald-300 font-semibold">{challengeTitle}</span>
            {categoryLabel ? ` (${categoryLabel})` : ''}.
          </p>
        </div>

        {/* Points Reward Badge */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-emerald-950/60 border border-emerald-500/30 flex items-center justify-center gap-3">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="text-left">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Reward Earned</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wider">
              +{pointsAwarded} POINTS
            </div>
          </div>
        </div>

        {/* Unlocked Lesson Card (if linked) */}
        {unlockedLesson && (
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-left space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Knowledge Lesson Unlocked!</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Dive deep into root causes, attack mechanics, and defense code for{' '}
              <strong className="text-cyan-200">{unlockedLesson.title}</strong>.
            </p>
            <div className="pt-1">
              <Link
                to={`/knowledge/${unlockedLesson.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-4"
              >
                Read Lesson Analysis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          {unlockedLesson ? (
            <Link to={`/knowledge/${unlockedLesson.slug}`} onClick={onClose} className="w-full sm:w-auto">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs h-10 px-5 gap-2">
                <BookOpen className="w-4 h-4" /> Study Lesson
              </Button>
            </Link>
          ) : (
            <Link to="/challenges" onClick={onClose} className="w-full sm:w-auto">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs h-10 px-5 gap-2 shadow-md shadow-emerald-950/50">
                <ShieldCheck className="w-4 h-4" /> More Challenges
              </Button>
            </Link>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs h-10 px-5"
          >
            Continue Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Unlock,
  Terminal,
  ChevronLeft,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService } from '@/services/knowledge.service';
import { KnowledgeProgress } from '@/types';
import {
  ROADMAP_NODES,
  FINAL_NODE_INDEX,
  NODE_DISTANCES,
  TOTAL_PATH_LENGTH,
  getNodeCategoryStats,
  getSequentialUnlockedIndex,
} from '@/constants/learningRoadmap';

export const LearningProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [progress, setProgress] = useState<KnowledgeProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [simulatePlayerLock, setSimulatePlayerLock] = useState<boolean>(false);
  const [currentFeeling, setCurrentFeeling] = useState<string>("You've got this! 💪");
  const [bubblePopping, setBubblePopping] = useState<boolean>(false);
  const [funnyAction, setFunnyAction] = useState<string>('');
  const [boyExpression, setBoyExpression] = useState<'neutral' | 'happy' | 'shock' | 'dizzy' | 'cool' | 'motivate' | 'dance'>('neutral');
  const [lockedShakeIdx, setLockedShakeIdx] = useState<number | null>(null);

  const actionTimeoutRef = useRef<number | null>(null);
  const bubbleTimeoutRef = useRef<number | null>(null);
  const lockShakeTimeoutRef = useRef<number | null>(null);
  const idleTickRef = useRef<number>(0);
  const nextClickPresetRef = useRef<number>(4);

  const IDLE_FEELINGS = [
    "You've got this! 💪",
    "Never stop learning! 📚",
    "One step closer! 🚀",
    "Believe in yourself! ✨",
    "Stay curious & sharp! 🧠",
    "Small steps, big wins! 🏆",
    "Every bug teaches you! 💡",
    "Keep pushing forward! 🔥",
    "You are growing fast! 🌟",
    "Don't give up! ⚡",
    "Focus wins the flag! 🚩",
    "Practice makes master! 🛡️",
  ];

  const FUNNY_ACTION_PRESETS: Array<{
    cls: string;
    expr: 'happy' | 'shock' | 'dizzy' | 'cool' | 'motivate' | 'dance';
    duration: number;
    feelings: string[];
  }> = [
    { cls: 'act-motivate', expr: 'motivate', duration: 2650, feelings: ["Hello! You've got this! 👋", "Hey champ! Keep going! 💪", "Hi! Next flag is yours! 🚩", "I believe in you! 🌟", "Stay strong, keep learning! 🔥", "You can solve anything! 🚀"] },
    { cls: 'act-jump', expr: 'happy', duration: 1150, feelings: ["Way to go! Keep rising! 🏆", "Unstoppable energy! 🔥", "You're crushing it! 🌟"] },
    { cls: 'act-matrix', expr: 'shock', duration: 1550, feelings: ["Nothing can stop you! 🛡️", "Stay sharp & fearless! ⚡", "Obstacles make you strong! 💪"] },
    { cls: 'act-shades', expr: 'cool', duration: 2250, feelings: ["True cyber pro mindset! 😎", "Confidence unlocked! 🔓", "Born to conquer CTFs! 💻"] },
    { cls: 'act-dance', expr: 'dance', duration: 3650, feelings: ["Celebrate every win! 🕺", "Keep that momentum! 🔥", "You're unstoppable! 🚀"] },
    { cls: 'act-spin', expr: 'dizzy', duration: 1650, feelings: ["100% effort, 0% quit! 🌀", "Stay energized & curious! ☕", "Spin into mastery! 🌟"] },
  ];

  const triggerBubblePop = useCallback((feeling: string) => {
    setCurrentFeeling(feeling);
    setBubblePopping(false);
    requestAnimationFrame(() => setBubblePopping(true));
    if (bubbleTimeoutRef.current) window.clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = window.setTimeout(() => setBubblePopping(false), 360);
  }, []);

  const triggerFunnyAction = useCallback((presetIndex?: number) => {
    if (isWalking) return;
    let idx: number;
    if (typeof presetIndex === 'number') {
      idx = presetIndex;
    } else {
      idx = nextClickPresetRef.current;
      nextClickPresetRef.current = (nextClickPresetRef.current + 1) % FUNNY_ACTION_PRESETS.length;
    }
    const preset = FUNNY_ACTION_PRESETS[idx];
    const quote = preset.feelings[Math.floor(Math.random() * preset.feelings.length)];

    if (actionTimeoutRef.current) window.clearTimeout(actionTimeoutRef.current);

    setFunnyAction('');
    requestAnimationFrame(() => {
      setFunnyAction(preset.cls);
      setBoyExpression(preset.expr);
      triggerBubblePop(quote);
    });

    actionTimeoutRef.current = window.setTimeout(() => {
      setFunnyAction('');
      setBoyExpression('neutral');
    }, preset.duration);
  }, [isWalking, triggerBubblePop]);

  // Greet the player by looking at them with motivation shortly after load
  useEffect(() => {
    if (isLoading) return;
    const greetTimer = window.setTimeout(() => {
      if (!isWalking) {
        triggerFunnyAction(0);
      }
    }, 900);
    return () => window.clearTimeout(greetTimer);
  }, [isLoading]);

  // Periodic idle feeling cycle: alternates between hacker thoughts and looking at the player with motivation
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isWalking && !funnyAction) {
        idleTickRef.current += 1;
        if (idleTickRef.current % 2 === 0) {
          triggerFunnyAction(0);
        } else {
          const randomFeeling = IDLE_FEELINGS[Math.floor(Math.random() * IDLE_FEELINGS.length)];
          triggerBubblePop(randomFeeling);
        }
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isWalking, funnyAction, triggerBubblePop, triggerFunnyAction]);

  const bubbleWidth = Math.max(106, Math.round(currentFeeling.length * 4.9 + 40));

  const motionPathRef = useRef<SVGPathElement>(null);
  const completedPathRef = useRef<SVGPathElement>(null);
  const boyRef = useRef<SVGGElement>(null);
  const boyOrienterRef = useRef<SVGGElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const currentDistRef = useRef<number>(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const playerMaxUnlockedIndex = getSequentialUnlockedIndex(progress?.categories);
  const effectiveMaxUnlockedIndex = isAdmin && !simulatePlayerLock ? FINAL_NODE_INDEX : playerMaxUnlockedIndex;

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const res: any = await knowledgeService.getProgress();
      const data = res?.data || res;
      setProgress(data);

      // Determine initial unlocked frontier strictly from real completed categories in order
      if (data && Array.isArray(data.categories)) {
        const sequentialUnlocked = getSequentialUnlockedIndex(data.categories);
        const initialIdx = Math.min(FINAL_NODE_INDEX, sequentialUnlocked);
        setActiveNodeIndex(initialIdx);
        currentDistRef.current = NODE_DISTANCES[initialIdx];

        // Update positions once mounted
        setTimeout(() => {
          if (motionPathRef.current && boyRef.current) {
            const pt = motionPathRef.current.getPointAtLength(NODE_DISTANCES[initialIdx]);
            boyRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
          }
          if (completedPathRef.current) {
            completedPathRef.current.style.strokeDashoffset = (TOTAL_PATH_LENGTH - NODE_DISTANCES[initialIdx]).toString();
          }
        }, 50);
      }
    } catch (err: any) {
      console.error('Failed to load learning progress:', err);
      // Fallback default state
      setProgress({
        totalLessons: 0,
        unlockedCount: 0,
        completedCount: 0,
        solvedChallengesCount: 0,
        completionPercentage: 0,
        categories: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up animation frame & timers on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (actionTimeoutRef.current) window.clearTimeout(actionTimeoutRef.current);
      if (bubbleTimeoutRef.current) window.clearTimeout(bubbleTimeoutRef.current);
      if (lockShakeTimeoutRef.current) window.clearTimeout(lockShakeTimeoutRef.current);
    };
  }, []);

  // Helper to walk the boy along the path up to allowed milestones (free walk for Admins unless simulating player locks)
  const walkBoyToNode = useCallback((targetIdx: number) => {
    if (isWalking) return;
    targetIdx = Math.max(0, Math.min(FINAL_NODE_INDEX, targetIdx));

    // Block walking past the current incomplete category for players (or Admins in Player Lock preview)
    if (targetIdx > effectiveMaxUnlockedIndex) {
      const blockingNode = ROADMAP_NODES[effectiveMaxUnlockedIndex];
      setLockedShakeIdx(targetIdx);
      if (lockShakeTimeoutRef.current) window.clearTimeout(lockShakeTimeoutRef.current);
      lockShakeTimeoutRef.current = window.setTimeout(() => setLockedShakeIdx(null), 460);

      if (actionTimeoutRef.current) window.clearTimeout(actionTimeoutRef.current);
      setFunnyAction('');
      requestAnimationFrame(() => {
        setFunnyAction('act-motivate');
        setBoyExpression('motivate');
        triggerBubblePop(`Complete ${blockingNode.name} first! 🔒`);
      });
      actionTimeoutRef.current = window.setTimeout(() => {
        setFunnyAction('');
        setBoyExpression('neutral');
      }, 2400);
      return;
    }

    const startDist = currentDistRef.current;
    const targetDist = NODE_DISTANCES[targetIdx];
    if (Math.abs(targetDist - startDist) < 1) {
      triggerFunnyAction();
      return;
    }

    if (actionTimeoutRef.current) window.clearTimeout(actionTimeoutRef.current);
    setFunnyAction('');
    setBoyExpression('neutral');
    setIsWalking(true);
    triggerBubblePop("Moving closer to mastery! 🚀");

    if (boyRef.current) {
      boyRef.current.classList.remove('react-boy-idle');
      boyRef.current.classList.add('react-boy-walking');
    }

    const distDiff = Math.abs(targetDist - startDist);
    // Calm human walking speed: ~95px/s for realistic unhurried footsteps (gently faster only on multi-row jumps)
    const walkSpeed = distDiff > 650 ? Math.min(185, 95 + (distDiff - 650) * 0.04) : 95;
    const walkDuration = Math.max(1200, (distDiff / walkSpeed) * 1000);
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(1, elapsed / walkDuration);

      // Gentle easeInOutSine so velocity stays natural and steady without sliding
      const ease = -(Math.cos(Math.PI * progressRatio) - 1) / 2;

      const currentD = startDist + (targetDist - startDist) * ease;
      currentDistRef.current = currentD;

      if (motionPathRef.current && boyRef.current) {
        const pt = motionPathRef.current.getPointAtLength(currentD);
        boyRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);

        // Calculate tangent direction to face left or right
        const forward = targetDist > startDist;
        const aheadDist = forward
          ? Math.min(TOTAL_PATH_LENGTH, currentD + 2)
          : Math.max(0, currentD - 2);
        const ptAhead = motionPathRef.current.getPointAtLength(aheadDist);
        const dx = ptAhead.x - pt.x;

        if (boyOrienterRef.current) {
          if (forward) {
            boyOrienterRef.current.style.transform = (dx < -0.1) ? 'scaleX(-1)' : 'scaleX(1)';
          } else {
            boyOrienterRef.current.style.transform = (dx > 0.1) ? 'scaleX(-1)' : 'scaleX(1)';
          }
        }
      }

      // Dynamically light up completed road in neon green behind the boy
      if (completedPathRef.current) {
        completedPathRef.current.style.strokeDashoffset = (TOTAL_PATH_LENGTH - currentD).toString();
      }

      if (progressRatio < 1) {
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        // Arrived at unlocked milestone!
        currentDistRef.current = targetDist;
        setActiveNodeIndex(targetIdx);
        setIsWalking(false);

        if (boyRef.current) {
          boyRef.current.classList.remove('react-boy-walking');
          boyRef.current.classList.add('react-boy-idle');
        }

        // Celebrate arrival with victory jump, happy expression & feeling bubble!
        setFunnyAction('act-jump');
        setBoyExpression('happy');
        triggerBubblePop(targetIdx === FINAL_NODE_INDEX ? "You conquered all flags! 🏆" : "Ready for this milestone! 🌟");
        actionTimeoutRef.current = window.setTimeout(() => {
          setFunnyAction('');
          setBoyExpression('neutral');
        }, 1150);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(step);
  }, [isWalking, effectiveMaxUnlockedIndex, triggerFunnyAction, triggerBubblePop]);

  if (isLoading && !progress) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Aggregating security mastery analytics...</p>
      </div>
    );
  }

  const categories = progress?.categories ?? [];
  const totalLessons =
    progress?.totalLessons ?? categories.reduce((sum, c) => sum + c.total, 0);
  const dynamicCategoryCount = categories.length || 12;

  // Shared real category lookup helper per roadmap node index
  const getCatProgressByIdx = (nodeIdx: number) =>
    getNodeCategoryStats(categories, ROADMAP_NODES[nodeIdx]);

  // Reflect actual completed lessons from backend progress
  const dynamicCompletedLessons =
    progress?.completedCount ?? categories.reduce((sum, c) => sum + c.completed, 0);
  const dynamicPct =
    totalLessons > 0 ? Math.min(100, Math.round((dynamicCompletedLessons / totalLessons) * 100)) : 0;

  const activeNode = ROADMAP_NODES[activeNodeIndex];

  const renderNodeIcon = (idx: number, strokeColor: string) => {
    switch (idx) {
      case 0:
        // Foundations: Shield + Globe/Core emblem
        return (
          <>
            <path d="M 0 -10.5 L 8.5 -6.5 V 1 C 8.5 6.5 4.5 10 0 11.5 C -4.5 10 -8.5 6.5 -8.5 1 V -6.5 Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <circle cx="0" cy="-0.5" r="3" stroke={strokeColor} strokeWidth="1.6" fill="none" className="node-icon-path" />
          </>
        );
      case 1:
        // Auth & Access Control: Shield + Check
        return (
          <>
            <path d="M 0 -10 C 4 -8 8 -7 10 -5 C 10 3 6 8 0 11 C -6 8 -10 3 -10 -5 C -8 -7 -4 -8 0 -10 Z" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <path d="M -3 0 L -1 2.5 L 4 -2.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
          </>
        );
      case 2:
        // SQL Injection: Database cylinders
        return (
          <>
            <ellipse cx="0" cy="-6" rx="10" ry="3.5" stroke={strokeColor} strokeWidth="1.8" fill="none" className="node-icon-path" />
            <path d="M -10 -6 V 0 C -10 2 0 3.5 10 0 V -6" stroke={strokeColor} strokeWidth="1.8" fill="none" className="node-icon-path" />
            <path d="M -10 0 V 6 C -10 8 0 9.5 10 6 V 0" stroke={strokeColor} strokeWidth="1.8" fill="none" className="node-icon-path" />
          </>
        );
      case 3:
        // Cross Site Scripting (XSS): </>
        return (
          <>
            <path d="M -8 -6 L -13 0 L -8 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <path d="M 8 -6 L 13 0 L 8 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <line x1="2.5" y1="-8" x2="-2.5" y2="8" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" className="node-icon-path" />
          </>
        );
      case 4:
        // Path Traversal: Folder
        return (
          <path d="M -10 7 V -7 C -10 -8 -9 -9 -8 -9 H -4 L -1 -6 H 8 C 9 -6 10 -5 10 -4 V 7 C 10 8 9 9 8 9 H -8 C -9 9 -10 8 -10 7 Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill="none" className="node-icon-path" />
        );
      case 5:
        // API Security: { }
        return (
          <>
            <path d="M -4 -8 C -7 -8 -7 -4 -7 -2 C -7 0 -9 0 -9 0 C -7 0 -7 0 -7 2 C -7 4 -7 8 -4 8" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" className="node-icon-path" />
            <path d="M 4 -8 C 7 -8 7 -4 7 -2 C 7 0 9 0 9 0 C 7 0 7 0 7 2 C 7 4 7 8 4 8" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" className="node-icon-path" />
          </>
        );
      case 6:
        // IDOR: ID Badge
        return (
          <>
            <rect x="-10" y="-8" width="20" height="16" rx="2" stroke={strokeColor} strokeWidth="1.8" fill="none" className="node-icon-path" />
            <circle cx="-4" cy="-2" r="2.5" stroke={strokeColor} strokeWidth="1.5" fill="none" className="node-icon-path" />
            <line x1="2" y1="-3" x2="7" y2="-3" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" className="node-icon-path" />
            <line x1="2" y1="0.5" x2="7" y2="0.5" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" className="node-icon-path" />
            <path d="M -7 4 C -7 2.5 -5.5 1.5 -4 1.5 C -2.5 1.5 -1 2.5 -1 4" stroke={strokeColor} strokeWidth="1.5" fill="none" className="node-icon-path" />
          </>
        );
      case 7:
        // SSRF: Server Rack
        return (
          <>
            <rect x="-10" y="-9" width="20" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.6" fill="none" className="node-icon-path" />
            <circle cx="-6" cy="-5.5" r="1" fill={strokeColor} />
            <line x1="1" y1="-5.5" x2="6" y2="-5.5" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" className="node-icon-path" />
            <rect x="-10" y="2" width="20" height="7" rx="1.5" stroke={strokeColor} strokeWidth="1.6" fill="none" className="node-icon-path" />
            <circle cx="-6" cy="5.5" r="1" fill={strokeColor} />
            <line x1="1" y1="5.5" x2="6" y2="5.5" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" className="node-icon-path" />
          </>
        );
      case 8:
        // Command Injection: >_
        return (
          <>
            <path d="M -8 -5 L -3 0 L -8 5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <line x1="1" y1="5" x2="8" y2="5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" className="node-icon-path" />
          </>
        );
      case 9:
        // JWT: Key
        return (
          <>
            <circle cx="-3" cy="0" r="4.5" stroke={strokeColor} strokeWidth="1.8" fill="none" className="node-icon-path" />
            <path d="M 1.5 0 H 10 M 7 0 V 3.5 M 9.5 0 V 2.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="node-icon-path" />
          </>
        );
      case 10:
        // Business Logic: Shopping cart
        return (
          <>
            <circle cx="-3.5" cy="7" r="1.8" fill={strokeColor} />
            <circle cx="5.5" cy="7" r="1.8" fill={strokeColor} />
            <path d="M -10 -7 H -7.5 L -5 3 H 7 L 9.5 -3.5 H -6" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
          </>
        );
      case 11:
        // Insecure Deserialization: Cube
        return (
          <>
            <path d="M 0 -9 L 9 -4.5 L 9 5.5 L 0 10.5 L -9 5.5 L -9 -4.5 Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill="none" className="node-icon-path" />
            <line x1="0" y1="10.5" x2="0" y2="0.5" stroke={strokeColor} strokeWidth="1.5" className="node-icon-path" />
            <line x1="0" y1="0.5" x2="9" y2="-4.5" stroke={strokeColor} strokeWidth="1.5" className="node-icon-path" />
            <line x1="0" y1="0.5" x2="-9" y2="-4.5" stroke={strokeColor} strokeWidth="1.5" className="node-icon-path" />
          </>
        );
      default:
        // Capture All Flags: Flag
        return (
          <path d="M -6 -9 V 9 M -6 -9 C -2 -11 2 -7 6 -8.5 V 0.5 C 2 2 -2 -2 -6 -0.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="node-icon-path" />
        );
    }
  };

  return (
    <div className="space-y-7 animate-fade-in pb-16 w-full max-w-[1400px] mx-auto font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? '/admin/knowledge' : '/knowledge'}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isAdmin ? 'Knowledge Admin' : 'Security Knowledge Library'}</span>
          </Link>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
              <Shield className="w-3 h-3" />
              ADMIN MODE
            </span>
          )}
        </div>

        <Link to={isAdmin ? '/admin/challenges' : '/challenges'}>
          <Button variant="outline" size="sm" className="font-mono text-xs border-zinc-800 gap-1.5 h-8">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            {isAdmin ? 'Manage Challenges' : 'CTF Challenges Arena'}
          </Button>
        </Link>
      </div>

      {/* ================================================================== */}
      {/* 2 & 3. HERO TITLE BLOCK & PROGRESS SUMMARY CARD                   */}
      {/* ================================================================== */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            <span className="opacity-60">//</span>
            <span>{isAdmin ? 'ADMIN ROADMAP INSPECTOR' : 'LEARNING PATH'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Security Learning Roadmap
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed font-mono xl:whitespace-nowrap">
            {isAdmin
              ? `Admin View: ${totalLessons} lessons across ${dynamicCategoryCount} categories. Walk freely or toggle Player Lock Preview.`
              : `${dynamicCategoryCount} categories, ${totalLessons} lessons. Solve challenges to unlock lessons and master every category.`}
          </p>
        </div>

        {/* Overall Security Mastery Progress Card */}
        <div className="bg-[#0b110e] border border-[#22372b] rounded-xl p-5 min-w-[320px] shrink-0 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-400">Overall security mastery</span>
            <span className="text-[#2dff7a] font-bold">
              {dynamicCompletedLessons} / {totalLessons} lessons · {dynamicPct}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#14231b] rounded-full overflow-hidden border border-[#22372b]/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-[#2dff7a] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(45,255,122,0.45)]"
              style={{ width: `${Math.max(2, Math.min(100, dynamicPct))}%` }}
            />
          </div>
        </div>
      </section>

      {/* Admin-Only Command & Lock Simulation Bar */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-950/20 px-4 py-3 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2.5 text-amber-200">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300">Admin Controls:</span>
            <span className="text-zinc-300">
              Player Gate currently at{' '}
              <strong className="text-emerald-400">
                {ROADMAP_NODES[playerMaxUnlockedIndex].level} ({ROADMAP_NODES[playerMaxUnlockedIndex].name})
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isWalking}
              onClick={() => {
                const nextSim = !simulatePlayerLock;
                setSimulatePlayerLock(nextSim);
                if (nextSim && activeNodeIndex > playerMaxUnlockedIndex) {
                  setActiveNodeIndex(playerMaxUnlockedIndex);
                  currentDistRef.current = NODE_DISTANCES[playerMaxUnlockedIndex];
                  if (motionPathRef.current && boyRef.current) {
                    const pt = motionPathRef.current.getPointAtLength(NODE_DISTANCES[playerMaxUnlockedIndex]);
                    boyRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
                  }
                  if (completedPathRef.current) {
                    completedPathRef.current.style.strokeDashoffset = (
                      TOTAL_PATH_LENGTH - NODE_DISTANCES[playerMaxUnlockedIndex]
                    ).toString();
                  }
                }
              }}
              className={`h-7 text-xs font-mono gap-1.5 ${
                simulatePlayerLock
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              {simulatePlayerLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{simulatePlayerLock ? 'Player Lock Simulation: ON' : 'Admin Free Walk: ON'}</span>
            </Button>
            <Link to="/admin/knowledge">
              <Button size="sm" variant="outline" className="h-7 text-xs font-mono border-zinc-700 text-zinc-200 hover:bg-zinc-800">
                Edit Lessons &rarr;
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 4. ROADMAP CARD: RESPONSIVE INTERACTIVE ANIMATED SVG               */}
      {/* ================================================================== */}
      <section className="relative rounded-2xl border border-[#22372b] bg-[#0b110e]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Corner Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* SVG Horizontal Scroll Wrapper for Small Screens */}
        <div className="w-full overflow-x-auto overflow-y-hidden pb-4 pt-2 roadmap-scroll-wrap">
          <svg
            className="w-full min-w-[1060px] max-w-[1260px] mx-auto block"
            viewBox="0 0 1260 760"
            role="img"
            aria-label="Interactive CTF security learning roadmap depicting 13 skill milestones from Web Security Fundamentals to Capture All Flags"
          >
            <defs>
              <filter id="reactNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <style>{`
                /* Pulsing halo around the active milestone */
                .react-pulse-ring {
                  fill: none;
                  stroke: #2dff7a;
                  stroke-width: 1.5;
                  opacity: 0.8;
                  animation: reactExpandWave 2.8s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
                }
                @keyframes reactExpandWave {
                  0% { r: 28px; opacity: 0.85; stroke-width: 2px; }
                  70% { opacity: 0.35; }
                  100% { r: 42px; opacity: 0; stroke-width: 0.5px; }
                }

                .react-node {
                  cursor: pointer;
                  outline: none !important;
                  user-select: none;
                  -webkit-user-select: none;
                  -webkit-tap-highlight-color: transparent;
                }
                .react-node:focus,
                .react-node:focus-visible,
                .react-node:active {
                  outline: none !important;
                }

                .react-node:hover .node-circle-hover {
                  stroke: #2dff7a !important;
                  filter: drop-shadow(0 0 10px rgba(45, 255, 122, 0.55)) !important;
                }

                /* Active/Hold state - smooth neon feedback without distortion or jumping */
                .react-node:active .node-circle-hover {
                  stroke: #8dffb8 !important;
                  filter: drop-shadow(0 0 14px rgba(45, 255, 122, 0.85)) !important;
                }

                .react-node:hover text {
                  fill: #ffffff;
                }

                /* Node Completed styling */
                .node-is-completed .node-circle-hover {
                  stroke: #2dff7a !important;
                  fill: #0d1a12 !important;
                  filter: drop-shadow(0 0 10px rgba(45, 255, 122, 0.3)) !important;
                }
                .node-is-completed .node-icon-path {
                  stroke: #2dff7a !important;
                }

                /* Locked milestone styling — boy cannot walk here until prior category is completed */
                .react-node-locked {
                  cursor: not-allowed;
                  opacity: 0.52;
                }
                .react-node-locked:hover .node-circle-hover {
                  stroke: #52525b !important;
                  filter: none !important;
                }
                .react-node-locked:active .node-circle-hover {
                  stroke: #ef4444 !important;
                  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.45)) !important;
                }
                .react-node-locked:hover text {
                  fill: #a1a1aa;
                }
                .node-shake {
                  animation: nodeLockedShake 0.42s ease-in-out both;
                }
                @keyframes nodeLockedShake {
                  0%, 100% { transform: translateX(0px); }
                  20% { transform: translateX(-4px); }
                  40% { transform: translateX(4px); }
                  60% { transform: translateX(-3px); }
                  80% { transform: translateX(3px); }
                }

                /* ============================================================
                   HACKER AVATAR — articulated human rig
                   Every rotating joint is an INNER <g> whose parent <g> holds the
                   translate(). CSS transforms replace the SVG transform attribute,
                   so position and rotation must never live on the same element.
                   Rotation sign: +deg swings a limb backward, -deg forward.
                   ============================================================ */
                #reactInteractiveBoy {
                  will-change: transform;
                  cursor: pointer;
                  outline: none;
                  -webkit-tap-highlight-color: transparent;
                }
                #reactBoyOrienter {
                  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.4, 1);
                }
                .boy-action, .boy-gait, .boy-torso, .boy-head, .boy-hair-bounce,
                .boy-leg-front-hip, .boy-leg-back-hip, .boy-leg-front-knee, .boy-leg-back-knee,
                .boy-foot-front-ankle, .boy-foot-back-ankle,
                .boy-arm-front-shoulder, .boy-arm-back-shoulder, .boy-arm-front-elbow, .boy-arm-back-elbow {
                  transform-origin: 0px 0px;
                }
                .boy-torso { transform-origin: 0px -40px; }
                .boy-head { transform-origin: 0px 7px; }
                .boy-shadow { transform-origin: 1px 0.5px; transform-box: view-box; }

                /* ---------- IDLE: relaxed standing pose + breathing + blinking ---------- */
                .react-boy-idle .boy-leg-front-hip { transform: rotate(-3deg); }
                .react-boy-idle .boy-leg-front-knee { transform: rotate(4deg); }
                .react-boy-idle .boy-foot-front-ankle { transform: rotate(-1deg); }
                .react-boy-idle .boy-leg-back-hip { transform: rotate(4deg); }
                .react-boy-idle .boy-leg-back-knee { transform: rotate(6deg); }
                .react-boy-idle .boy-foot-back-ankle { transform: rotate(-10deg); }
                .react-boy-idle .boy-arm-front-shoulder { transform: rotate(5deg); }
                .react-boy-idle .boy-arm-front-elbow { transform: rotate(-14deg); }
                .react-boy-idle .boy-arm-back-shoulder { transform: rotate(-4deg); }
                .react-boy-idle .boy-arm-back-elbow { transform: rotate(-16deg); }
                .react-boy-idle .boy-torso { animation: boyBreathe 3.2s ease-in-out infinite alternate; }
                .react-boy-idle .boy-head { animation: boyHeadIdle 6s ease-in-out infinite; }
                @keyframes boyBreathe {
                  0% { transform: translateY(0px) scaleY(1); }
                  100% { transform: translateY(-0.6px) scaleY(1.012); }
                }
                @keyframes boyHeadIdle {
                  0%, 40% { transform: rotate(0deg); }
                  48%, 70% { transform: rotate(-6deg); }
                  78%, 100% { transform: rotate(0deg); }
                }
                .boy-eye-blink { transform-origin: 4.3px 0px; transform-box: view-box; animation: boyBlink 4.2s infinite; }
                .roadmap-lesson-link { cursor: pointer; transition: fill 0.15s ease, opacity 0.15s ease; }
                .roadmap-lesson-link:hover { fill: #5eff9c; text-decoration: underline; text-underline-offset: 3px; }
                @keyframes boyBlink {
                  0%, 92%, 100% { transform: scaleY(1); }
                  95% { transform: scaleY(0.1); }
                }

                /* ---------- WALK: relaxed slow 8-phase human gait cycle (1.3s) ---------- */
                .react-boy-walking .boy-gait { animation: walkGaitBob 1.3s linear infinite; }
                .react-boy-walking .boy-shadow { animation: walkShadow 1.3s linear infinite; }
                .react-boy-walking .boy-torso { animation: walkTorso 1.3s ease-in-out infinite; }
                .react-boy-walking .boy-head { animation: walkHead 1.3s ease-in-out infinite; }
                .react-boy-walking .boy-hair-bounce { animation: walkHair 0.65s ease-in-out infinite; }
                .react-boy-walking .boy-leg-front-hip { animation: walkFrontThigh 1.3s linear infinite; }
                .react-boy-walking .boy-leg-front-knee { animation: walkFrontKnee 1.3s linear infinite; }
                .react-boy-walking .boy-foot-front-ankle { animation: walkFrontAnkle 1.3s linear infinite; }
                .react-boy-walking .boy-leg-back-hip { animation: walkBackThigh 1.3s linear infinite; }
                .react-boy-walking .boy-leg-back-knee { animation: walkBackKnee 1.3s linear infinite; }
                .react-boy-walking .boy-foot-back-ankle { animation: walkBackAnkle 1.3s linear infinite; }
                .react-boy-walking .boy-arm-front-shoulder { animation: walkFrontShoulder 1.3s ease-in-out infinite; }
                .react-boy-walking .boy-arm-front-elbow { animation: walkFrontElbow 1.3s ease-in-out infinite; }
                .react-boy-walking .boy-arm-back-shoulder { animation: walkBackShoulder 1.3s ease-in-out infinite; }
                .react-boy-walking .boy-arm-back-elbow { animation: walkBackElbow 1.3s ease-in-out infinite; }

                /* Whole body dips subtly at heel strike (0%, 50%) and rises at mid-stance */
                @keyframes walkGaitBob {
                  0%, 50%, 100% { transform: translateY(1.8px); }
                  12%, 62% { transform: translateY(2.2px); }
                  25%, 75% { transform: translateY(0px); }
                  37%, 87% { transform: translateY(-0.4px); }
                }
                @keyframes walkShadow {
                  0%, 50%, 100% { transform: scale(1.05, 1); opacity: 0.75; }
                  37%, 87% { transform: scale(0.92, 0.92); opacity: 0.58; }
                }
                @keyframes walkTorso {
                  0%, 50%, 100% { transform: rotate(-1.5deg); }
                  25%, 75% { transform: rotate(-2.5deg) translateY(-0.3px); }
                }
                @keyframes walkHead {
                  0%, 50%, 100% { transform: rotate(-1deg); }
                  25%, 75% { transform: rotate(1deg); }
                }
                @keyframes walkHair {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-2deg); }
                }
                /* Front leg: heel strike at 0%, toe-off at 50%, swing 50-100% */
                @keyframes walkFrontThigh {
                  0% { transform: rotate(-22deg); } 12% { transform: rotate(-15deg); }
                  25% { transform: rotate(-4deg); } 37% { transform: rotate(7deg); }
                  50% { transform: rotate(16deg); } 62% { transform: rotate(10deg); }
                  75% { transform: rotate(-5deg); } 87% { transform: rotate(-20deg); }
                  100% { transform: rotate(-22deg); }
                }
                @keyframes walkFrontKnee {
                  0% { transform: rotate(4deg); } 12% { transform: rotate(14deg); }
                  25% { transform: rotate(5deg); } 37% { transform: rotate(4deg); }
                  50% { transform: rotate(20deg); } 62% { transform: rotate(48deg); }
                  75% { transform: rotate(52deg); } 87% { transform: rotate(18deg); }
                  100% { transform: rotate(4deg); }
                }
                @keyframes walkFrontAnkle {
                  0% { transform: rotate(7deg); } 12% { transform: rotate(0deg); }
                  25% { transform: rotate(-2deg); } 37% { transform: rotate(-7deg); }
                  50% { transform: rotate(-9deg); } 62% { transform: rotate(-24deg); }
                  75% { transform: rotate(-26deg); } 87% { transform: rotate(-5deg); }
                  100% { transform: rotate(7deg); }
                }
                /* Back leg: same cycle shifted by half a stride */
                @keyframes walkBackThigh {
                  0% { transform: rotate(16deg); } 12% { transform: rotate(10deg); }
                  25% { transform: rotate(-5deg); } 37% { transform: rotate(-20deg); }
                  50% { transform: rotate(-22deg); } 62% { transform: rotate(-15deg); }
                  75% { transform: rotate(-4deg); } 87% { transform: rotate(7deg); }
                  100% { transform: rotate(16deg); }
                }
                @keyframes walkBackKnee {
                  0% { transform: rotate(20deg); } 12% { transform: rotate(48deg); }
                  25% { transform: rotate(52deg); } 37% { transform: rotate(18deg); }
                  50% { transform: rotate(4deg); } 62% { transform: rotate(14deg); }
                  75% { transform: rotate(5deg); } 87% { transform: rotate(4deg); }
                  100% { transform: rotate(20deg); }
                }
                @keyframes walkBackAnkle {
                  0% { transform: rotate(-9deg); } 12% { transform: rotate(-24deg); }
                  25% { transform: rotate(-26deg); } 37% { transform: rotate(-5deg); }
                  50% { transform: rotate(7deg); } 62% { transform: rotate(0deg); }
                  75% { transform: rotate(-2deg); } 87% { transform: rotate(-7deg); }
                  100% { transform: rotate(-9deg); }
                }
                /* Relaxed natural arm swing opposite to legs */
                @keyframes walkFrontShoulder {
                  0%, 100% { transform: rotate(16deg); }
                  50% { transform: rotate(-16deg); }
                }
                @keyframes walkFrontElbow {
                  0%, 100% { transform: rotate(-10deg); }
                  50% { transform: rotate(-28deg); }
                }
                @keyframes walkBackShoulder {
                  0%, 100% { transform: rotate(-16deg); }
                  50% { transform: rotate(16deg); }
                }
                @keyframes walkBackElbow {
                  0%, 100% { transform: rotate(-28deg); }
                  50% { transform: rotate(-10deg); }
                }

                /* ============================================================
                   FUNNY ACTIONS (class on #reactInteractiveBoy: act-*)
                   ============================================================ */

                /* 1. VICTORY JUMP — crouch, launch with both fists up, tuck, squash landing */
                .act-jump .boy-action { animation: actJumpBody 1.1s cubic-bezier(0.3, 0.7, 0.4, 1) both; }
                .act-jump .boy-shadow { animation: actJumpShadow 1.1s ease-in-out both; }
                .act-jump .boy-arm-front-shoulder { animation: actJumpArmF 1.1s ease-out both; }
                .act-jump .boy-arm-back-shoulder { animation: actJumpArmB 1.1s ease-out both; }
                .act-jump .boy-arm-front-elbow, .act-jump .boy-arm-back-elbow { animation: actJumpElbow 1.1s ease-out both; }
                .act-jump .boy-leg-front-hip, .act-jump .boy-leg-back-hip { animation: actJumpThigh 1.1s ease-in-out both; }
                .act-jump .boy-leg-front-knee, .act-jump .boy-leg-back-knee { animation: actJumpKnee 1.1s ease-in-out both; }
                @keyframes actJumpBody {
                  0% { transform: translateY(0) scale(1, 1); }
                  18% { transform: translateY(0) scale(1.08, 0.88); }
                  42% { transform: translateY(-28px) scale(0.94, 1.08); }
                  56% { transform: translateY(-31px) scale(1, 1); }
                  76% { transform: translateY(0) scale(1.1, 0.9); }
                  88% { transform: translateY(0) scale(0.97, 1.03); }
                  100% { transform: translateY(0) scale(1, 1); }
                }
                @keyframes actJumpShadow {
                  0%, 18%, 76%, 100% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(0.45); opacity: 0.25; }
                }
                @keyframes actJumpArmF {
                  0% { transform: rotate(5deg); } 18% { transform: rotate(35deg); }
                  40% { transform: rotate(-168deg); } 70% { transform: rotate(-150deg); }
                  86% { transform: rotate(-160deg); } 100% { transform: rotate(5deg); }
                }
                @keyframes actJumpArmB {
                  0% { transform: rotate(-4deg); } 18% { transform: rotate(30deg); }
                  40% { transform: rotate(-155deg); } 70% { transform: rotate(-140deg); }
                  86% { transform: rotate(-150deg); } 100% { transform: rotate(-4deg); }
                }
                @keyframes actJumpElbow {
                  0% { transform: rotate(-14deg); } 40% { transform: rotate(-30deg); }
                  86% { transform: rotate(-25deg); } 100% { transform: rotate(-14deg); }
                }
                @keyframes actJumpThigh {
                  0%, 100% { transform: rotate(-2deg); } 18% { transform: rotate(-28deg); }
                  45% { transform: rotate(-50deg); } 66% { transform: rotate(-6deg); }
                  78% { transform: rotate(-22deg); }
                }
                @keyframes actJumpKnee {
                  0%, 100% { transform: rotate(4deg); } 18% { transform: rotate(52deg); }
                  45% { transform: rotate(95deg); } 66% { transform: rotate(10deg); }
                  78% { transform: rotate(42deg); }
                }

                /* 2. MATRIX DODGE — slow-motion bend backwards, arms windmilling in panic */
                .act-matrix .boy-action { animation: actMatrixBody 1.5s ease-in-out both; }
                .act-matrix .boy-arm-front-shoulder { animation: actMatrixArmF 1.5s linear both; }
                .act-matrix .boy-arm-back-shoulder { animation: actMatrixArmB 1.5s linear both; }
                .act-matrix .boy-leg-front-hip { animation: actMatrixThighF 1.5s ease-in-out both; }
                .act-matrix .boy-leg-front-knee { animation: actMatrixKneeF 1.5s ease-in-out both; }
                .act-matrix .boy-head { animation: actMatrixHead 1.5s ease-in-out both; }
                @keyframes actMatrixBody {
                  0% { transform: rotate(0deg); }
                  25% { transform: rotate(-48deg) translateX(-2px); }
                  70% { transform: rotate(-54deg) translateX(-2px); }
                  85% { transform: rotate(6deg); }
                  100% { transform: rotate(0deg); }
                }
                @keyframes actMatrixArmF {
                  0% { transform: rotate(5deg); }
                  20% { transform: rotate(-150deg); }
                  45% { transform: rotate(-330deg); }
                  70% { transform: rotate(-510deg); }
                  100% { transform: rotate(-715deg); }
                }
                @keyframes actMatrixArmB {
                  0% { transform: rotate(-4deg); }
                  20% { transform: rotate(-200deg); }
                  45% { transform: rotate(-380deg); }
                  70% { transform: rotate(-560deg); }
                  100% { transform: rotate(-724deg); }
                }
                @keyframes actMatrixThighF {
                  0%, 100% { transform: rotate(-3deg); }
                  25%, 70% { transform: rotate(-38deg); }
                }
                @keyframes actMatrixKneeF {
                  0%, 100% { transform: rotate(4deg); }
                  25%, 70% { transform: rotate(48deg); }
                }
                @keyframes actMatrixHead {
                  0%, 100% { transform: rotate(0deg); }
                  25%, 70% { transform: rotate(22deg); }
                }

                /* 3. DEAL WITH IT — pixel shades drop from the sky, finger-gun, smug lean */
                .act-shades .boy-action { animation: actShadesBody 2.2s ease-in-out both; }
                .act-shades .boy-arm-front-shoulder { animation: actShadesArm 2.2s ease-in-out both; }
                .act-shades .boy-arm-front-elbow { animation: actShadesElbow 2.2s ease-in-out both; }
                .act-shades .boy-head { animation: actShadesHead 2.2s ease-in-out both; }
                .boy-shades { animation: actShadesDrop 2.2s cubic-bezier(0.5, 0, 0.75, 0) both; }
                @keyframes actShadesBody {
                  0%, 100% { transform: rotate(0deg); }
                  45%, 85% { transform: rotate(-5deg); }
                }
                @keyframes actShadesArm {
                  0% { transform: rotate(5deg); }
                  45%, 85% { transform: rotate(-82deg); }
                  52% { transform: rotate(-70deg); }
                  100% { transform: rotate(5deg); }
                }
                @keyframes actShadesElbow {
                  0%, 100% { transform: rotate(-14deg); }
                  45%, 85% { transform: rotate(-6deg); }
                }
                @keyframes actShadesHead {
                  0%, 30% { transform: rotate(0deg); }
                  36% { transform: rotate(6deg); }
                  42%, 85% { transform: rotate(-4deg); }
                  100% { transform: rotate(0deg); }
                }
                @keyframes actShadesDrop {
                  0% { transform: translateY(-34px); opacity: 0; }
                  8% { opacity: 1; }
                  32% { transform: translateY(0px); }
                  36% { transform: translateY(-1.6px); }
                  40%, 88% { transform: translateY(0px); opacity: 1; }
                  100% { transform: translateY(0px); opacity: 0; }
                }

                /* 4. TIKTOK GROOVE DANCE — 4-phase knee-bounce choreography */
                .act-dance .dance-upper { transform-origin: 0px -38px; animation: danceGroove 3.6s ease-in-out 1 both; }
                .act-dance .boy-shadow { transform-origin: 1px 0.5px; animation: danceShadow 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-l-hip { transform-origin: 0px 0px; animation: danceLegLHip 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-l-knee { transform-origin: 0px 0px; animation: danceLegLKnee 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-l-ankle { transform-origin: 0px 0px; animation: danceLegLAnkle 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-r-hip { transform-origin: 0px 0px; animation: danceLegRHip 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-r-knee { transform-origin: 0px 0px; animation: danceLegRKnee 3.6s ease-in-out 1 both; }
                .act-dance .dance-leg-r-ankle { transform-origin: 0px 0px; animation: danceLegRAnkle 3.6s ease-in-out 1 both; }
                .act-dance .dance-arm-l-sh { transform-origin: 0px 0px; animation: danceArmLSh 3.6s ease-in-out 1 both; }
                .act-dance .dance-arm-l-el { transform-origin: 0px 0px; animation: danceArmLEl 3.6s ease-in-out 1 both; }
                .act-dance .dance-arm-r-sh { transform-origin: 0px 0px; animation: danceArmRSh 3.6s ease-in-out 1 both; }
                .act-dance .dance-arm-r-el { transform-origin: 0px 0px; animation: danceArmREl 3.6s ease-in-out 1 both; }
                .act-dance .dance-head { transform-origin: 0px 7px; animation: danceHeadBob 3.6s ease-in-out 1 both; }
                .act-dance .dance-hair { transform-origin: 0px -6px; animation: danceHairBob 3.6s ease-in-out 1 both; }

                /* Upper-body drop/hip sway matched to knee flexion so soles stay on y=0 */
                @keyframes danceGroove {
                  0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                  7%  { transform: translate(0px, 4px) rotate(0deg); }
                  14% { transform: translate(0px, 0.4px) rotate(-3deg); }
                  21% { transform: translate(-1.5px, 4px) rotate(-4deg); }
                  28% { transform: translate(1.8px, 0.5px) rotate(4deg); }
                  35% { transform: translate(2.2px, 4px) rotate(5deg); }
                  42% { transform: translate(-2.2px, 0.5px) rotate(-5deg); }
                  49% { transform: translate(2.2px, 4px) rotate(5deg); }
                  56% { transform: translate(0px, 0.2px) rotate(0deg); }
                  63% { transform: translate(0px, 3.8px) rotate(0deg); }
                  71% { transform: translate(0px, -0.5px) rotate(0deg); }
                  79% { transform: translate(-3.5px, 4px) rotate(-6deg); }
                  86% { transform: translate(3.5px, 4px) rotate(6deg); }
                  93% { transform: translate(-2px, 2.5px) rotate(-3deg); }
                }
                @keyframes danceShadow {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: scaleX(1.05) scaleY(1); opacity: 0.48; }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: scaleX(1.32) scaleY(1.1); opacity: 0.62; }
                }
                /* Left leg (+X hip rotates outward, -knee bends inward, +ankle keeps sole flat) */
                @keyframes danceLegLHip {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(4deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(38deg); }
                  93% { transform: rotate(24deg); }
                }
                @keyframes danceLegLKnee {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(-6deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(-50deg); }
                  93% { transform: rotate(-32deg); }
                }
                @keyframes danceLegLAnkle {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(2deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(12deg); }
                  93% { transform: rotate(8deg); }
                }
                /* Right leg (mirrored angles) */
                @keyframes danceLegRHip {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(-4deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(-38deg); }
                  93% { transform: rotate(-24deg); }
                }
                @keyframes danceLegRKnee {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(6deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(50deg); }
                  93% { transform: rotate(32deg); }
                }
                @keyframes danceLegRAnkle {
                  0%, 14%, 28%, 42%, 56%, 71%, 100% { transform: rotate(-2deg); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: rotate(-12deg); }
                  93% { transform: rotate(-8deg); }
                }
                /* Left arm (x=-9): +angle swings outward/up-left; -angle bends inward across body */
                @keyframes danceArmLSh {
                  0%, 100% { transform: rotate(8deg); }
                  7%  { transform: rotate(-25deg); }
                  14% { transform: rotate(115deg); }
                  21% { transform: rotate(25deg); }
                  28% { transform: rotate(20deg); }
                  35% { transform: rotate(25deg); }
                  42% { transform: rotate(20deg); }
                  49% { transform: rotate(25deg); }
                  56% { transform: rotate(135deg); }
                  63% { transform: rotate(150deg); }
                  71% { transform: rotate(115deg); }
                  79% { transform: rotate(35deg); }
                  86% { transform: rotate(45deg); }
                  93% { transform: rotate(25deg); }
                }
                @keyframes danceArmLEl {
                  0%, 100% { transform: rotate(12deg); }
                  7%  { transform: rotate(-105deg); }
                  14% { transform: rotate(60deg); }
                  21% { transform: rotate(-135deg); }
                  28% { transform: rotate(-65deg); }
                  35% { transform: rotate(-135deg); }
                  42% { transform: rotate(-65deg); }
                  49% { transform: rotate(-135deg); }
                  56% { transform: rotate(35deg); }
                  63% { transform: rotate(65deg); }
                  71% { transform: rotate(15deg); }
                  79% { transform: rotate(-95deg); }
                  86% { transform: rotate(-75deg); }
                  93% { transform: rotate(-55deg); }
                }
                /* Right arm (x=+9): mirrored signs (-angle outward/up-right, +angle inward) */
                @keyframes danceArmRSh {
                  0%, 100% { transform: rotate(-8deg); }
                  7%  { transform: rotate(25deg); }
                  14% { transform: rotate(-115deg); }
                  21% { transform: rotate(-20deg); }
                  28% { transform: rotate(-25deg); }
                  35% { transform: rotate(-20deg); }
                  42% { transform: rotate(-25deg); }
                  49% { transform: rotate(-20deg); }
                  56% { transform: rotate(-135deg); }
                  63% { transform: rotate(-150deg); }
                  71% { transform: rotate(-115deg); }
                  79% { transform: rotate(-45deg); }
                  86% { transform: rotate(-35deg); }
                  93% { transform: rotate(-25deg); }
                }
                @keyframes danceArmREl {
                  0%, 100% { transform: rotate(-12deg); }
                  7%  { transform: rotate(105deg); }
                  14% { transform: rotate(-60deg); }
                  21% { transform: rotate(65deg); }
                  28% { transform: rotate(135deg); }
                  35% { transform: rotate(65deg); }
                  42% { transform: rotate(135deg); }
                  49% { transform: rotate(65deg); }
                  56% { transform: rotate(-35deg); }
                  63% { transform: rotate(-65deg); }
                  71% { transform: rotate(-15deg); }
                  79% { transform: rotate(75deg); }
                  86% { transform: rotate(95deg); }
                  93% { transform: rotate(55deg); }
                }
                @keyframes danceHeadBob {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  7%, 21%, 35%, 49%, 63% { transform: translateY(1px) rotate(-6deg); }
                  14%, 28%, 42%, 56%, 71% { transform: translateY(-0.8px) rotate(6deg); }
                  79% { transform: translateY(1px) rotate(8deg); }
                  86% { transform: translateY(1px) rotate(-8deg); }
                }
                @keyframes danceHairBob {
                  0%, 100% { transform: translateY(0px); }
                  7%, 21%, 35%, 49%, 63%, 79%, 86% { transform: translateY(-1.2px); }
                }

                /* 5. CAFFEINE SPIN — 360 flip, then a dizzy wobble */
                .act-spin .boy-action { transform-origin: 0px -44px; animation: actSpinBody 1.6s ease-out both; }
                .act-spin .boy-shadow { animation: actJumpShadow 1.6s ease-in-out both; }
                .act-spin .boy-arm-front-shoulder, .act-spin .boy-arm-back-shoulder { animation: actSpinArms 1.6s ease-in-out both; }
                @keyframes actSpinBody {
                  0% { transform: translateY(0px) rotate(0deg); }
                  12% { transform: translateY(3px) rotate(-8deg); }
                  42% { transform: translateY(-20px) rotate(360deg); }
                  54% { transform: translateY(0px) rotate(360deg); }
                  64% { transform: translateY(0px) rotate(374deg); }
                  74% { transform: translateY(0px) rotate(348deg); }
                  84% { transform: translateY(0px) rotate(368deg); }
                  100% { transform: translateY(0px) rotate(360deg); }
                }
                @keyframes actSpinArms {
                  0%, 100% { transform: rotate(0deg); }
                  20%, 45% { transform: rotate(-95deg); }
                  64% { transform: rotate(-40deg); }
                  74% { transform: rotate(-70deg); }
                }

                /* 6. LOOK AT PLAYER, WAVE HELLO & MOTIVATE */
                .act-motivate .boy-action { animation: actMotivateBody 2.6s ease-in-out both; }
                .act-motivate .front-head-nod { transform-origin: 0px 7px; animation: actMotivateHead 2.6s ease-in-out both; }
                .act-motivate .front-wave-shoulder { transform-origin: 0px 0px; animation: frontWaveShoulder 2.6s ease-in-out both; }
                .act-motivate .front-wave-elbow { transform-origin: 0px 0px; animation: frontWaveElbow 2.6s ease-in-out both; }
                .act-motivate .front-wave-hand { transform-origin: 0px 0px; animation: frontWaveHand 2.6s ease-in-out both; }
                .act-motivate .front-left-arm { transform-origin: 0px 0px; animation: frontLeftArm 2.6s ease-in-out both; }
                @keyframes actMotivateBody {
                  0%, 100% { transform: translateY(0px) scale(1); }
                  12%, 88% { transform: translateY(-1px) scale(1.02); }
                  40%, 65% { transform: translateY(-2.5px) scale(1.03); }
                }
                @keyframes actMotivateHead {
                  0%, 100% { transform: rotate(0deg); }
                  20% { transform: rotate(-4deg); }
                  42% { transform: rotate(4deg); }
                  64% { transform: rotate(-3deg); }
                  84% { transform: rotate(2deg); }
                }
                @keyframes frontWaveShoulder {
                  0%, 100% { transform: rotate(-18deg); }
                  15%, 84% { transform: rotate(-115deg); }
                }
                @keyframes frontWaveElbow {
                  0%, 100% { transform: rotate(-12deg); }
                  18% { transform: rotate(-35deg); }
                  30% { transform: rotate(-72deg); }
                  42% { transform: rotate(-32deg); }
                  54% { transform: rotate(-72deg); }
                  66% { transform: rotate(-32deg); }
                  78% { transform: rotate(-55deg); }
                }
                @keyframes frontWaveHand {
                  0%, 100% { transform: rotate(0deg); }
                  22%, 46%, 70% { transform: rotate(16deg); }
                  34%, 58% { transform: rotate(-16deg); }
                }
                @keyframes frontLeftArm {
                  0%, 100% { transform: rotate(4deg); }
                  20%, 80% { transform: rotate(14deg); }
                }

                /* Sweat drop for panic face */
                .boy-sweat { animation: boySweat 0.6s ease-in-out infinite alternate; }
                @keyframes boySweat {
                  0% { transform: translateY(0px); }
                  100% { transform: translateY(1.5px); }
                }

                /* ---------- Feeling speech bubble ---------- */
                .feeling-bubble {
                  transform-origin: 0px 0px;
                  animation: bubbleFloat 2.6s ease-in-out infinite alternate;
                  user-select: none;
                  -webkit-user-select: none;
                }
                @keyframes bubbleFloat {
                  0% { transform: translateY(0px); }
                  100% { transform: translateY(-2.5px); }
                }
                .bubble-pop { animation: bubblePopAnim 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) both; }
                @keyframes bubblePopAnim {
                  0% { transform: scale(0.5); opacity: 0; }
                  60% { transform: scale(1.12); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                  .react-pulse-ring, .feeling-bubble, .bubble-pop, .boy-eye-blink, .boy-sweat,
                  #reactInteractiveBoy *, #reactInteractiveBoy {
                    animation: none !important;
                    transition: none !important;
                  }
                }
              `}</style>
            </defs>

            {/* Reference Snaking Motion Path (4-Row Snake covering all 12 categories + Capture All Flags) */}
            <path
              ref={motionPathRef}
              id="reactRoadmapMotionPath"
              d="M 180 120 L 1080 120 A 90 90 0 0 1 1080 300 L 180 300 A 90 90 0 0 0 180 480 L 1080 480 A 85 85 0 0 1 1080 650 L 630 650"
              fill="none"
            />

            {/* Base Dashed Dim Line */}
            <path
              d="M 180 120 L 1080 120 A 90 90 0 0 1 1080 300 L 180 300 A 90 90 0 0 0 180 480 L 1080 480 A 85 85 0 0 1 1080 650 L 630 650"
              stroke="#22372b"
              strokeWidth="3.5"
              strokeDasharray="8 8"
              fill="none"
            />

            {/* Dynamically Illuminated Neon Green Path behind the boy */}
            <path
              ref={completedPathRef}
              id="reactCompletedRoadPath"
              d="M 180 120 L 1080 120 A 90 90 0 0 1 1080 300 L 180 300 A 90 90 0 0 0 180 480 L 1080 480 A 85 85 0 0 1 1080 650 L 630 650"
              stroke="#2dff7a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: TOTAL_PATH_LENGTH,
                strokeDashoffset: TOTAL_PATH_LENGTH,
                filter: 'drop-shadow(0 0 8px rgba(45, 255, 122, 0.65))',
                transition: isWalking ? 'none' : 'stroke-dashoffset 0.4s ease-out',
              }}
            />

            {/* ========================================================== */}
            {/* 13 MILESTONE NODES (12 Categories + Final Goal)            */}
            {/* ========================================================== */}
            <g id="reactNodesLayer">
              {/* Active Pulse Ring around the current active milestone */}
              <circle
                cx={activeNode.x}
                cy={activeNode.y}
                className="react-pulse-ring"
              />

              {ROADMAP_NODES.map((node, idx) => {
                const stats = getCatProgressByIdx(idx);
                const isFinal = idx === FINAL_NODE_INDEX;
                const isCompleted = isFinal ? playerMaxUnlockedIndex >= FINAL_NODE_INDEX : stats.isCompleted;
                const isUnlocked = idx <= effectiveMaxUnlockedIndex;
                const isActive = activeNodeIndex === idx;
                const highlight = isActive || isCompleted;
                const iconStroke = highlight ? '#2dff7a' : isUnlocked ? '#b9d3c4' : '#64748b';
                const isShaking = lockedShakeIdx === idx;

                return (
                  <g
                    key={node.id}
                    className={`react-node ${isCompleted ? 'node-is-completed' : ''} ${!isUnlocked ? 'react-node-locked' : ''} ${isShaking ? 'node-shake' : ''}`}
                    onClick={() => walkBoyToNode(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        walkBoyToNode(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-disabled={!isUnlocked}
                    aria-label={`Node ${idx + 1}: ${node.name}${isUnlocked ? '' : ' (Locked until prior category completed)'}`}
                  >
                    {idx === 0 && activeNodeIndex !== 0 && (
                      <text x={node.x} y={node.y - 42} textAnchor="middle" fill="#2dff7a" fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fontWeight="700" letterSpacing="0.12em">
                        {isCompleted ? 'MASTERED ✓' : 'START HERE'}
                      </text>
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="28"
                      fill="#0b110e"
                      stroke={isActive ? '#2dff7a' : isCompleted ? '#2dff7a' : '#22372b'}
                      strokeWidth={isActive ? 2.6 : 2.2}
                      strokeDasharray={isFinal ? '5 4' : undefined}
                      className="node-circle-hover"
                      filter={isActive ? 'url(#reactNeonGlow)' : undefined}
                    />

                    <g transform={`translate(${node.x}, ${node.y})`}>
                      {renderNodeIcon(idx, iconStroke)}
                    </g>

                    {/* Mini padlock badge when locked until previous category completes */}
                    {!isUnlocked && (
                      <g transform={`translate(${node.x + 20}, ${node.y - 20})`}>
                        <circle cx="0" cy="0" r="8" fill="#0b110e" stroke="#3f3f46" strokeWidth="1.2" />
                        <path d="M -2.5 -0.8 V -2.6 A 2.5 2.5 0 0 1 2.5 -2.6 V -0.8" stroke="#a1a1aa" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        <rect x="-3.4" y="-0.8" width="6.8" height="4.8" rx="1" fill="#18181b" stroke="#a1a1aa" strokeWidth="1.1" />
                      </g>
                    )}

                    <text
                      x={node.x}
                      y={node.y + 46}
                      textAnchor="middle"
                      fill={isActive ? '#ffffff' : isUnlocked ? '#e6f5ec' : '#94a3b8'}
                      fontFamily="'Sora', sans-serif"
                      fontSize="13.5"
                      fontWeight="700"
                    >
                      {node.name}
                    </text>

                    <text
                      x={node.x}
                      y={node.y + 62}
                      textAnchor="middle"
                      fill={highlight ? '#2dff7a' : '#93ab9f'}
                      fontFamily="'IBM Plex Mono', monospace"
                      fontSize="11"
                      className={isUnlocked ? 'roadmap-lesson-link' : 'cursor-not-allowed'}
                      role="link"
                      tabIndex={0}
                      aria-label={
                        isUnlocked
                          ? `Open ${node.name} learning path`
                          : `${node.name} is locked until previous category completes`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUnlocked) {
                          walkBoyToNode(idx);
                          return;
                        }
                        if (isFinal) {
                          navigate('/learning-paths');
                        } else {
                          navigate(`/learning-paths?category=${encodeURIComponent(node.dbCategory)}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isUnlocked) {
                            walkBoyToNode(idx);
                            return;
                          }
                          if (isFinal) {
                            navigate('/learning-paths');
                          } else {
                            navigate(`/learning-paths?category=${encodeURIComponent(node.dbCategory)}`);
                          }
                        }
                      }}
                    >
                      <title>
                        {isUnlocked
                          ? `Open ${node.name} in Learning Paths`
                          : `Complete previous category first to unlock ${node.name}`}
                      </title>
                      {isFinal
                        ? `${totalLessons} lessons · final`
                        : isCompleted
                        ? `${stats.total} / ${stats.total} lessons · 100% ✓`
                        : `${stats.completed} / ${stats.total} lessons · ${stats.pct}%`}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* ========================================================== */}
            {/* INTERACTIVE HACKER AVATAR (Rendered on top)                */}
            {/* Positioning <g> and rotating <g> are always separate.      */}
            {/* ========================================================== */}
            <g
              ref={boyRef}
              id="reactInteractiveBoy"
              className={`${isWalking ? 'react-boy-walking' : 'react-boy-idle'} ${funnyAction}`}
              transform={`translate(${ROADMAP_NODES[activeNodeIndex].x}, ${ROADMAP_NODES[activeNodeIndex].y})`}
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))' }}
              onClick={() => triggerFunnyAction()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerFunnyAction();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Hacker avatar. Press to make him do something funny."
            >
              {/* Ground contact shadow */}
              <ellipse cx="1" cy="0.5" rx="13" ry="3" fill="rgba(0, 0, 0, 0.75)" className="boy-shadow" />

              <g className="boy-action">
                {/* Orienter: flips horizontally when walking leftwards */}
                <g ref={boyOrienterRef} id="reactBoyOrienter" style={{ display: boyExpression === 'motivate' || boyExpression === 'dance' ? 'none' : 'inline' }}>
                  <g className="boy-gait">

                    {/* ---------- BACK ARM (far side, darker) ---------- */}
                    <g transform="translate(-0.5, -59.5)">
                      <g className="boy-arm-back-shoulder">
                        <path d="M -2.7 -1 Q -3 7 -2.3 13 L 2.3 13 Q 3 7 2.7 -1 Q 0 -3 -2.7 -1 Z" fill="#111b16" stroke="#050907" strokeWidth="0.6" />
                        <g transform="translate(0, 13)">
                          <g className="boy-arm-back-elbow">
                            <circle cx="0" cy="0" r="2.3" fill="#111b16" />
                            <path d="M -2.3 0 Q -2.4 5 -2 9.5 L 2 9.5 Q 2.4 5 2.3 0 Z" fill="#111b16" stroke="#050907" strokeWidth="0.6" />
                            <rect x="-2.2" y="8.4" width="4.4" height="1.8" rx="0.6" fill="#0a120d" />
                            <path d="M -1.8 10.2 Q -2.4 13.5 -0.6 14.6 Q 1.6 15.2 2.2 13 Q 2.4 11 1.8 10.2 Z" fill="#d9ae8c" stroke="#7a5238" strokeWidth="0.4" />
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* ---------- BACK LEG (far side, darker) ---------- */}
                    <g transform="translate(-1, -40)">
                      <g className="boy-leg-back-hip">
                        <path d="M -3.8 -1 Q -4.2 8 -3 18 L 3 18 Q 4.4 8 3.8 -1 Z" fill="#1b232b" stroke="#07090b" strokeWidth="0.6" />
                        <g transform="translate(0, 18)">
                          <g className="boy-leg-back-knee">
                            <circle cx="0" cy="0" r="3" fill="#1b232b" />
                            <path d="M -3 0 Q -3.2 10 -2.4 17.5 L 2.6 17.5 Q 3.4 10 3 0 Z" fill="#1b232b" stroke="#07090b" strokeWidth="0.6" />
                            <rect x="-2.9" y="15.6" width="5.8" height="2.2" rx="0.8" fill="#12181e" />
                            <g transform="translate(0, 19)">
                              <g className="boy-foot-back-ankle">
                                <path d="M -3.4 -1.6 Q -3.9 1.6 -2.6 3 L 8 3 Q 9.6 2.8 9.2 1 Q 8.6 -0.6 5.4 -1.2 L 2.6 -2.6 L -2.2 -2.6 Q -3.2 -2.4 -3.4 -1.6 Z" fill="#b9c4bd" stroke="#07090b" strokeWidth="0.6" />
                                <line x1="-2.8" y1="3" x2="8.6" y2="3" stroke="#1fae55" strokeWidth="1.2" strokeLinecap="round" />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* ---------- TORSO + HEAD ---------- */}
                    <g className="boy-torso">
                      {/* Pants seat / hips */}
                      <path d="M -6.4 -41.5 L 6.6 -41.5 Q 7.2 -37 5 -34.5 L -4.6 -34.5 Q -7.2 -37 -6.4 -41.5 Z" fill="#26313b" stroke="#07090b" strokeWidth="0.6" />
                      {/* Hood bunched behind the neck */}
                      <path d="M -5.5 -61.5 C -9.5 -62.5 -9.6 -68.5 -5 -69 C -2.8 -69 -1.8 -66 -1.4 -63.2 Z" fill="#15221b" stroke="#050907" strokeWidth="0.6" />
                      {/* Neck */}
                      <path d="M -1.6 -68.5 L 2.2 -68.5 L 2.4 -61.5 L -1.8 -61.5 Z" fill="#e8bf9c" />
                      <path d="M -1.6 -66 L 2.2 -64.8 L 2.3 -62.5 L -1.7 -63 Z" fill="#c99a76" opacity="0.7" />
                      {/* Hoodie body */}
                      <path d="M -5.2 -62.5 Q -7.6 -55 -6.8 -47 L -6.4 -39.5 Q 0 -38.2 6.6 -39.5 L 6.4 -47 Q 7.8 -55 5.4 -62 Q 0 -64.5 -5.2 -62.5 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.7" />
                      {/* Fabric shading on the back side */}
                      <path d="M -5.2 -62.5 Q -7.6 -55 -6.8 -47 L -6.4 -39.5 L -3.6 -39.2 Q -4.6 -50 -3.2 -62.8 Z" fill="#14211a" opacity="0.85" />
                      {/* Hem band + neon trim */}
                      <path d="M -6.5 -42 L 6.6 -42 L 6.6 -39.4 Q 0 -38.2 -6.4 -39.4 Z" fill="#14211a" />
                      <line x1="-6.4" y1="-42" x2="6.6" y2="-42" stroke="#2dff7a" strokeWidth="0.6" opacity="0.8" />
                      {/* Kangaroo pocket */}
                      <path d="M 0.8 -48.5 L 6.6 -48.5 L 6.5 -42.6 L 2 -42.6 Z" fill="none" stroke="#0a120d" strokeWidth="0.6" />
                      {/* Chest logo */}
                      <text x="0.2" y="-53" fill="#2dff7a" fontFamily="'IBM Plex Mono', monospace" fontSize="4.4" fontWeight="700">&gt;_</text>
                      {/* Drawstrings */}
                      <path d="M 4.2 -61.2 L 4.8 -55" stroke="#c9d6ce" strokeWidth="0.6" strokeLinecap="round" />
                      <circle cx="4.85" cy="-54.6" r="0.6" fill="#2dff7a" />

                      {/* HEAD (separate tilt joint at the neck) */}
                      <g transform="translate(1.5, -75)">
                        <g className="boy-head">
                          {/* Back hair mass (behind the face) */}
                          <path d="M -8.6 3 C -11 -3 -9 -10.5 -2 -11.8 C 3.5 -12.8 8.6 -10 9.2 -4.5 L 6 -2 L -3 2 L -6 6 Z" fill="#2e1d13" />
                          {/* Cranium */}
                          <circle cx="0" cy="-1" r="8" fill="#f2cba8" />
                          {/* Face & jaw, chin pointing forward */}
                          <path d="M -6 1 Q -5 7 0 8.6 Q 4.5 9.3 7.2 5.5 Q 8.6 3 8.4 -1 L 7 -4 Z" fill="#f2cba8" />
                          {/* Jaw shadow under the cheek */}
                          <path d="M -5.4 3.5 Q -3.5 7.6 0.5 8.4 Q -2.5 6 -3 3 Z" fill="#d9a986" opacity="0.8" />
                          {/* Nose */}
                          <path d="M 8.3 0.6 L 9.2 2.4 L 8.2 2.9" fill="#f2cba8" stroke="#c48d68" strokeWidth="0.45" strokeLinejoin="round" />
                          {/* Ear + cyber earpiece */}
                          <ellipse cx="-1.8" cy="1.2" rx="1.7" ry="2.4" fill="#e8bf9c" stroke="#c48d68" strokeWidth="0.4" />
                          <rect x="-3" y="-0.4" width="2.4" height="3.6" rx="1" fill="#060908" stroke="#2dff7a" strokeWidth="0.6" />
                          <circle cx="-1.8" cy="1.4" r="0.55" fill="#2dff7a" />
                          {/* Blush */}
                          <ellipse cx="4.6" cy="3.6" rx="1.5" ry="0.75" fill="#ff8f8f" opacity={boyExpression === 'happy' || boyExpression === 'cool' ? 0.55 : 0.28} />

                          {/* ---- EYES ---- */}
                          {boyExpression === 'neutral' && (
                            <g className="boy-eye-blink">
                              <ellipse cx="4.4" cy="0.2" rx="1.45" ry="2.15" fill="#2a1a12" />
                              <ellipse cx="4.6" cy="0.9" rx="0.9" ry="1.1" fill="#2f8f5a" />
                              <circle cx="4.85" cy="-0.6" r="0.6" fill="#ffffff" />
                              <path d="M 2.7 -1.9 Q 4.4 -3 6.2 -1.8" stroke="#1a0f0a" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                            </g>
                          )}
                          {boyExpression === 'happy' && (
                            <path d="M 2.8 0.8 Q 4.4 -2 6 0.8" stroke="#1a0f0a" strokeWidth="1" fill="none" strokeLinecap="round" />
                          )}
                          {boyExpression === 'shock' && (
                            <g>
                              <circle cx="4.5" cy="0" r="2.3" fill="#ffffff" stroke="#1a0f0a" strokeWidth="0.6" />
                              <circle cx="4.9" cy="0.1" r="0.75" fill="#1a0f0a" />
                            </g>
                          )}
                          {boyExpression === 'dizzy' && (
                            <path d="M 4.4 0 m -0.6 0 a 0.6 0.6 0 1 1 1.2 0 a 1.2 1.2 0 1 1 -2.4 0 a 1.8 1.8 0 1 1 3.6 0" stroke="#1a0f0a" strokeWidth="0.6" fill="none" />
                          )}
                          {boyExpression === 'cool' && (
                            <g>
                              <ellipse cx="4.4" cy="0.6" rx="1.45" ry="1.5" fill="#2a1a12" />
                              <path d="M 2.6 -0.4 L 6.3 -0.9" stroke="#1a0f0a" strokeWidth="1" strokeLinecap="round" />
                            </g>
                          )}

                          {/* ---- EYEBROW ---- */}
                          <path
                            d={
                              boyExpression === 'shock' ? 'M 2.6 -4.6 Q 4.4 -5.8 6.4 -4.6'
                                : boyExpression === 'cool' ? 'M 2.6 -2.6 L 6.4 -3.6'
                                : boyExpression === 'dizzy' ? 'M 2.6 -3.4 Q 4.4 -2.6 6.2 -3.8'
                                : 'M 2.6 -3.6 Q 4.4 -4.4 6.2 -3.5'
                            }
                            stroke="#2e1d13"
                            strokeWidth="0.9"
                            fill="none"
                            strokeLinecap="round"
                          />

                          {/* ---- MOUTH ---- */}
                          {boyExpression === 'neutral' && (
                            <path d="M 4.8 4.9 Q 6 5.7 7.1 4.7" stroke="#7a3a2a" strokeWidth="0.6" fill="none" strokeLinecap="round" />
                          )}
                          {boyExpression === 'happy' && (
                            <g>
                              <path d="M 4.2 4.2 Q 6 4.9 7.7 3.8 Q 7.3 7.4 4.9 6.4 Z" fill="#6e2620" stroke="#4a1712" strokeWidth="0.4" />
                              <path d="M 5 5.9 Q 6 6.9 7 6" fill="#ff7b86" />
                            </g>
                          )}
                          {boyExpression === 'shock' && (
                            <ellipse cx="6" cy="5.4" rx="1" ry="1.45" fill="#5a1a16" />
                          )}
                          {boyExpression === 'dizzy' && (
                            <path d="M 4.3 5 q 0.6 -0.7 1.2 0 t 1.2 0 t 1.2 0" stroke="#7a3a2a" strokeWidth="0.6" fill="none" strokeLinecap="round" />
                          )}
                          {boyExpression === 'cool' && (
                            <path d="M 4.6 5.2 Q 6.2 5.6 7.6 3.9" stroke="#7a3a2a" strokeWidth="0.7" fill="none" strokeLinecap="round" />
                          )}

                          {/* ---- FRONT HAIR: messy anime bangs ---- */}
                          <g className="boy-hair-bounce">
                            <path
                              d="M -8.5 2 C -10.5 -4 -8 -10.5 -2 -11.6 C 3 -12.6 8 -10 9 -5 C 9.4 -3 9.1 -1.6 8.7 -0.5 L 7.3 -3.1 L 6.5 -0.9 L 5.1 -3.6 L 3.7 -1.4 L 2.7 -4.1 L 0.7 -2.6 C -1 -2 -2.4 -1 -2.9 1.4 C -4 0 -5 1 -5.5 3.6 C -6.5 4.6 -8 4 -8.5 2 Z"
                              fill="#3b2618"
                              stroke="#160d07"
                              strokeWidth="0.55"
                              strokeLinejoin="round"
                            />
                            <path d="M -8 -6 L -12.4 -7.6 L -9 -3.4 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                            <path d="M -6 -9.6 L -10 -12.8 L -4.4 -11.1 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                            <path d="M -1 -11.4 L -1.6 -14.6 L 1.6 -11.8 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                            {/* Glossy highlight */}
                            <path d="M -4 -9.2 Q 0.5 -11 5 -8.6" stroke="#7a5236" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.75" />
                          </g>

                          {/* Panic sweat drop */}
                          {boyExpression === 'shock' && (
                            <path className="boy-sweat" d="M -5 -9 Q -6.6 -6.4 -5 -5.6 Q -3.4 -6.4 -5 -9 Z" fill="#8fd8ff" stroke="#3a8fbf" strokeWidth="0.4" />
                          )}

                          {/* "Deal with it" pixel shades */}
                          {boyExpression === 'cool' && (
                            <g className="boy-shades">
                              <rect x="-2.6" y="-2.8" width="5.2" height="1" fill="#050807" />
                              <rect x="1.8" y="-2.8" width="7.2" height="3.4" fill="#050807" />
                              <rect x="2.8" y="0.6" width="5.4" height="1.2" fill="#050807" />
                              <rect x="6.6" y="-2" width="1" height="1" fill="#2dff7a" />
                              <rect x="5.4" y="-0.9" width="0.9" height="0.9" fill="#2dff7a" opacity="0.7" />
                            </g>
                          )}
                        </g>
                      </g>
                    </g>

                    {/* ---------- FRONT LEG (near side) ---------- */}
                    <g transform="translate(1, -40)">
                      <g className="boy-leg-front-hip">
                        <path d="M -3.8 -1 Q -4.2 8 -3 18 L 3 18 Q 4.4 8 3.8 -1 Z" fill="#2b3742" stroke="#07090b" strokeWidth="0.6" />
                        <path d="M 1.6 1 Q 2.6 9 2 16" stroke="#3a4856" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                        <g transform="translate(0, 18)">
                          <g className="boy-leg-front-knee">
                            <circle cx="0" cy="0" r="3" fill="#2b3742" />
                            <path d="M -3 0 Q -3.2 10 -2.4 17.5 L 2.6 17.5 Q 3.4 10 3 0 Z" fill="#2b3742" stroke="#07090b" strokeWidth="0.6" />
                            <rect x="-2.9" y="15.6" width="5.8" height="2.2" rx="0.8" fill="#1d262e" />
                            <g transform="translate(0, 19)">
                              <g className="boy-foot-front-ankle">
                                <path d="M -3.4 -1.6 Q -3.9 1.6 -2.6 3 L 8 3 Q 9.6 2.8 9.2 1 Q 8.6 -0.6 5.4 -1.2 L 2.6 -2.6 L -2.2 -2.6 Q -3.2 -2.4 -3.4 -1.6 Z" fill="#eef3ef" stroke="#07090b" strokeWidth="0.6" />
                                <path d="M 1.4 -1.6 L 4.6 -0.7" stroke="#2dff7a" strokeWidth="0.7" strokeLinecap="round" />
                                <line x1="-2.8" y1="3" x2="8.6" y2="3" stroke="#2dff7a" strokeWidth="1.3" strokeLinecap="round" />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* ---------- FRONT ARM (near side) ---------- */}
                    <g transform="translate(0.5, -59.5)">
                      <g className="boy-arm-front-shoulder">
                        <path d="M -2.7 -1 Q -3 7 -2.3 13 L 2.3 13 Q 3 7 2.7 -1 Q 0 -3 -2.7 -1 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                        <g transform="translate(0, 13)">
                          <g className="boy-arm-front-elbow">
                            <circle cx="0" cy="0" r="2.3" fill="#22352a" />
                            <path d="M -2.3 0 Q -2.4 5 -2 9.5 L 2 9.5 Q 2.4 5 2.3 0 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                            <rect x="-2.2" y="8.4" width="4.4" height="1.8" rx="0.6" fill="#14211a" />
                            <line x1="-2.2" y1="8.4" x2="2.2" y2="8.4" stroke="#2dff7a" strokeWidth="0.5" opacity="0.8" />
                            <path d="M -1.8 10.2 Q -2.4 13.5 -0.6 14.6 Q 1.6 15.2 2.2 13 Q 2.4 11 1.8 10.2 Z" fill="#f2cba8" stroke="#a8724e" strokeWidth="0.4" />
                            <path d="M 1.6 10.9 Q 3.3 11.6 2.6 13.2" stroke="#a8724e" strokeWidth="0.45" fill="#f2cba8" strokeLinecap="round" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>

                {/* ====================================================== */}
                {/* FULL FRONT-FACING BODY (When looking at player & waving) */}
                {/* Rendered outside #reactBoyOrienter so text never flips */}
                {/* ====================================================== */}
                {boyExpression === 'motivate' && (
                  <g id="reactBoyFrontView">
                    {/* Left & Right Legs (Pants + Cuffs + Forward Sneakers) */}
                    <g>
                      {/* Left Leg */}
                      <path d="M -7.4 -41 L -1 -41 L -1.5 -5 L -7 -5 Z" fill="#2b3742" stroke="#07090b" strokeWidth="0.6" />
                      <line x1="-5.6" y1="-39" x2="-5.2" y2="-7" stroke="#3a4856" strokeWidth="0.8" strokeLinecap="round" />
                      <line x1="-6.8" y1="-22" x2="-1.8" y2="-22" stroke="#182028" strokeWidth="0.6" opacity="0.75" />
                      <rect x="-7.2" y="-5.6" width="5.8" height="2" rx="0.7" fill="#1d262e" />
                      {/* Left Sneaker */}
                      <path d="M -7.5 -3.6 Q -8 -0.6 -7.2 0 L -1.2 0 Q -0.6 -0.8 -1.4 -3.6 Z" fill="#eef3ef" stroke="#07090b" strokeWidth="0.6" />
                      <path d="M -5.8 -2.8 L -2.8 -2.8 M -5.6 -1.9 L -3 -1.9" stroke="#2dff7a" strokeWidth="0.6" strokeLinecap="round" />
                      <line x1="-7.2" y1="0" x2="-1.2" y2="0" stroke="#2dff7a" strokeWidth="1.3" strokeLinecap="round" />

                      {/* Right Leg */}
                      <path d="M 1 -41 L 7.4 -41 L 7 -5 L 1.5 -5 Z" fill="#2b3742" stroke="#07090b" strokeWidth="0.6" />
                      <line x1="5.6" y1="-39" x2="5.2" y2="-7" stroke="#3a4856" strokeWidth="0.8" strokeLinecap="round" />
                      <line x1="1.8" y1="-22" x2="6.8" y2="-22" stroke="#182028" strokeWidth="0.6" opacity="0.75" />
                      <rect x="1.4" y="-5.6" width="5.8" height="2" rx="0.7" fill="#1d262e" />
                      {/* Right Sneaker */}
                      <path d="M 1.4 -3.6 Q 0.6 -0.8 1.2 0 L 7.2 0 Q 8 -0.6 7.5 -3.6 Z" fill="#eef3ef" stroke="#07090b" strokeWidth="0.6" />
                      <path d="M 2.8 -2.8 L 5.8 -2.8 M 3 -1.9 L 5.6 -1.9" stroke="#2dff7a" strokeWidth="0.6" strokeLinecap="round" />
                      <line x1="1.2" y1="0" x2="7.2" y2="0" stroke="#2dff7a" strokeWidth="1.3" strokeLinecap="round" />

                      {/* Hips / Waistband */}
                      <path d="M -7.6 -42 L 7.6 -42 L 7.4 -37 Q 0 -35.5 -7.4 -37 Z" fill="#26313b" stroke="#07090b" strokeWidth="0.55" />
                    </g>

                    {/* Left Arm (relaxed at his side) */}
                    <g transform="translate(-8.2, -59.5)">
                      <g className="front-left-arm">
                        <path d="M -2.5 -1 Q -3 9.5 -2.3 19.5 L 2.2 19.5 Q 2.7 9.5 2.4 -1 Q 0 -3 -2.5 -1 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.6" />
                        <rect x="-2.4" y="18.2" width="4.6" height="1.8" rx="0.6" fill="#14211a" />
                        <line x1="-2.4" y1="18.2" x2="2.2" y2="18.2" stroke="#2dff7a" strokeWidth="0.5" opacity="0.8" />
                        <path d="M -1.8 20 Q -2.2 23.4 -0.4 24.4 Q 1.6 24.8 2 22.8 Q 2.2 21 1.6 20 Z" fill="#f2cba8" stroke="#a8724e" strokeWidth="0.4" />
                      </g>
                    </g>

                    {/* Front Hoodie Torso & Neck */}
                    <g>
                      {/* Hood collar behind shoulders */}
                      <path d="M -7 -62 C -8.6 -65 -4.8 -67.2 0 -66.6 C 4.8 -67.2 8.6 -65 7 -62 Z" fill="#15221b" stroke="#050907" strokeWidth="0.6" />
                      {/* Hoodie main silhouette */}
                      <path d="M -8.6 -61.5 Q 0 -64.2 8.6 -61.5 L 7.6 -40.2 Q 0 -38.6 -7.6 -40.2 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.7" />
                      {/* Subtle side contours */}
                      <path d="M -8.6 -61.5 L -5.7 -62.2 L -5.2 -40.1 L -7.6 -40.2 Z" fill="#14211a" opacity="0.6" />
                      <path d="M 8.6 -61.5 L 5.7 -62.2 L 5.2 -40.1 L 7.6 -40.2 Z" fill="#14211a" opacity="0.6" />
                      {/* Ribbed hem band + neon trim */}
                      <path d="M -7.6 -42.4 L 7.6 -42.4 L 7.6 -40.2 Q 0 -38.6 -7.6 -40.2 Z" fill="#14211a" />
                      <line x1="-7.6" y1="-42.4" x2="7.6" y2="-42.4" stroke="#2dff7a" strokeWidth="0.6" opacity="0.85" />
                      {/* Kangaroo pocket */}
                      <path d="M -4.8 -48.5 L 4.8 -48.5 L 5.5 -42.6 L -5.5 -42.6 Z" fill="#17241d" stroke="#0a120d" strokeWidth="0.6" />
                      {/* Centered Cyber Chest Logo */}
                      <text x="0" y="-53.2" textAnchor="middle" fill="#2dff7a" fontFamily="'IBM Plex Mono', monospace" fontSize="4.6" fontWeight="700">&gt;_</text>
                      {/* Symmetrical drawstrings */}
                      <path d="M -2.2 -61.5 L -2.4 -55.4" stroke="#c9d6ce" strokeWidth="0.6" strokeLinecap="round" />
                      <circle cx="-2.4" cy="-55" r="0.6" fill="#2dff7a" />
                      <path d="M 2.2 -61.5 L 2.4 -55.4" stroke="#c9d6ce" strokeWidth="0.6" strokeLinecap="round" />
                      <circle cx="2.4" cy="-55" r="0.6" fill="#2dff7a" />

                      {/* Neck */}
                      <path d="M -1.9 -68.5 L 1.9 -68.5 L 2 -61.5 L -2 -61.5 Z" fill="#e8bf9c" />
                      <path d="M -1.9 -66.5 Q 0 -65 1.9 -66.5 L 1.9 -64.2 Q 0 -63 -1.9 -64.2 Z" fill="#c99a76" opacity="0.7" />
                    </g>

                    {/* Right Arm (Raised UP waving "HELLO!" with open hand) */}
                    <g transform="translate(8.2, -59.5)">
                      <g className="front-wave-shoulder">
                        <path d="M -2.4 -1 Q -2.7 6 -2.2 11.5 L 2.2 11.5 Q 2.7 6 2.4 -1 Q 0 -3 -2.4 -1 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                        <g transform="translate(0, 11.5)">
                          <g className="front-wave-elbow">
                            <circle cx="0" cy="0" r="2.2" fill="#22352a" />
                            <path d="M -2.2 0 Q -2.3 5 -2 9.5 L 2 9.5 Q 2.3 5 2.2 0 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                            <rect x="-2.1" y="8.4" width="4.2" height="1.7" rx="0.6" fill="#14211a" />
                            <line x1="-2.1" y1="8.4" x2="2.1" y2="8.4" stroke="#2dff7a" strokeWidth="0.5" opacity="0.8" />
                            <g transform="translate(0, 10.1)">
                              <g className="front-wave-hand">
                                {/* Open waving palm + thumb + 4 fingers */}
                                <path d="M -2.1 0 L -2.3 2.8 Q -2.2 4.2 0 4.3 Q 2.2 4.2 2.3 2.8 L 2.1 0 Z" fill="#f2cba8" stroke="#a8724e" strokeWidth="0.4" />
                                <path d="M -2 1.3 Q -3.9 2.2 -3.4 3.6" stroke="#f2cba8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                                <path d="M -2 1.3 Q -3.9 2.2 -3.4 3.6" stroke="#a8724e" strokeWidth="0.35" strokeLinecap="round" fill="none" />
                                <line x1="-1.7" y1="3.6" x2="-2" y2="6.3" stroke="#f2cba8" strokeWidth="1.25" strokeLinecap="round" />
                                <line x1="-0.5" y1="3.8" x2="-0.5" y2="6.8" stroke="#f2cba8" strokeWidth="1.25" strokeLinecap="round" />
                                <line x1="0.7" y1="3.8" x2="0.9" y2="6.5" stroke="#f2cba8" strokeWidth="1.2" strokeLinecap="round" />
                                <line x1="1.8" y1="3.4" x2="2.2" y2="5.6" stroke="#f2cba8" strokeWidth="1.1" strokeLinecap="round" />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* Front-Facing Head (Looking straight at the player!) */}
                    <g transform="translate(0, -75)">
                      <g className="front-head-nod">
                        {/* Back hair */}
                        <path d="M -8.8 3.5 C -10.5 -3 -8.5 -11 0 -11.8 C 8.5 -11 10.5 -3 8.8 3.5 L 5 5 L -5 5 Z" fill="#2e1d13" />
                        {/* Left & Right Ears */}
                        <ellipse cx="-7.8" cy="1.2" rx="1.4" ry="2.2" fill="#e8bf9c" stroke="#c48d68" strokeWidth="0.4" />
                        <ellipse cx="7.8" cy="1.2" rx="1.4" ry="2.2" fill="#e8bf9c" stroke="#c48d68" strokeWidth="0.4" />
                        {/* Neon cyber earpiece on left ear */}
                        <rect x="-9.1" y="-0.2" width="1.9" height="3.2" rx="0.8" fill="#060908" stroke="#2dff7a" strokeWidth="0.55" />
                        <circle cx="-8.15" cy="1.4" r="0.5" fill="#2dff7a" />
                        {/* Symmetrical Face & Chin */}
                        <path d="M -7.4 -2 C -7.6 3.5 -4.4 7.4 0 8.5 C 4.4 7.4 7.6 3.5 7.4 -2 C 7.4 -7.2 4.2 -9.6 0 -9.6 C -4.2 -9.6 -7.4 -7.2 -7.4 -2 Z" fill="#f2cba8" />
                        <path d="M -3.5 6.4 Q 0 8.4 3.5 6.4 Q 0 7.7 -3.5 6.4 Z" fill="#d9a986" opacity="0.7" />
                        {/* Blush */}
                        <ellipse cx="-4.6" cy="2.8" rx="1.4" ry="0.7" fill="#ff8f8f" opacity="0.48" />
                        <ellipse cx="4.6" cy="2.8" rx="1.4" ry="0.7" fill="#ff8f8f" opacity="0.48" />
                        {/* Two Eyes looking directly at the player */}
                        <g className="boy-eye-blink">
                          <ellipse cx="-3.1" cy="0.3" rx="1.45" ry="2.1" fill="#2a1a12" />
                          <ellipse cx="-3.1" cy="0.9" rx="0.95" ry="1.15" fill="#2f8f5a" />
                          <circle cx="-2.65" cy="-0.6" r="0.6" fill="#ffffff" />
                          <path d="M -4.8 -1.6 Q -3.1 -2.8 -1.4 -1.6" stroke="#1a0f0a" strokeWidth="0.85" fill="none" strokeLinecap="round" />

                          <ellipse cx="3.1" cy="0.3" rx="1.45" ry="2.1" fill="#2a1a12" />
                          <ellipse cx="3.1" cy="0.9" rx="0.95" ry="1.15" fill="#2f8f5a" />
                          <circle cx="3.55" cy="-0.6" r="0.6" fill="#ffffff" />
                          <path d="M 1.4 -1.6 Q 3.1 -2.8 4.8 -1.6" stroke="#1a0f0a" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                        </g>
                        {/* Friendly Eyebrows */}
                        <path d="M -4.8 -3.5 Q -3.1 -4.4 -1.5 -3.5" stroke="#2e1d13" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                        <path d="M 1.5 -3.5 Q 3.1 -4.4 4.8 -3.5" stroke="#2e1d13" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                        {/* Nose */}
                        <path d="M -0.3 2.1 L 0.2 2.9 L -0.3 3.2" stroke="#c48d68" strokeWidth="0.45" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Encouraging Open Smile */}
                        <path d="M -2.5 4.4 Q 0 5.1 2.5 4.4 Q 1.9 7.1 0 7.1 Q -1.9 7.1 -2.5 4.4 Z" fill="#6e2620" stroke="#4a1712" strokeWidth="0.4" />
                        <path d="M -1.3 6.1 Q 0 7.1 1.3 6.1" fill="#ff7b86" />
                        {/* Front-facing messy bangs */}
                        <g className="boy-hair-bounce">
                          <path
                            d="M -8.4 1.6 C -9.8 -4.5 -7.5 -10.8 0 -11.6 C 7.5 -10.8 9.8 -4.5 8.4 1.6 L 7.4 2.8 L 6.5 -1.4 L 4.8 -3.6 L 3.4 -0.9 L 1.6 -3.8 L 0 -1.2 L -1.8 -3.8 L -3.5 -0.9 L -4.9 -3.6 L -6.6 -1.3 L -7.4 2.8 Z"
                            fill="#3b2618"
                            stroke="#160d07"
                            strokeWidth="0.55"
                            strokeLinejoin="round"
                          />
                          <path d="M -3.5 -11 L -5.4 -14.2 L -1.2 -11.5 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                          <path d="M 0 -11.5 L 1.8 -14.6 L 3.4 -11 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                          <path d="M -4.5 -8.8 Q 0 -10.6 4.5 -8.8" stroke="#7a5236" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.75" />
                        </g>
                      </g>
                    </g>
                  </g>
                )}

                {boyExpression === 'dance' && (
                  <g id="reactBoyFrontDance">
                    {/* Left Leg (hip -> knee -> ankle sneaker stays planted on y=0) */}
                    <g transform="translate(-4.6, -40)">
                      <g className="dance-leg-l-hip">
                        <path d="M -2.7 0 L -2.3 18.4 L 2.3 18.4 L 2.7 0 Z" fill="#182028" stroke="#07090b" strokeWidth="0.6" />
                        <g transform="translate(0, 18)">
                          <g className="dance-leg-l-knee">
                            <circle cx="0" cy="0" r="2.3" fill="#182028" />
                            <path d="M -2.3 0 L -2.1 18.2 L 2.1 18.2 L 2.3 0 Z" fill="#182028" stroke="#07090b" strokeWidth="0.6" />
                            <g transform="translate(0, 18)">
                              <g className="dance-leg-l-ankle">
                                <path d="M -2.5 0 Q -3.4 3 -2.9 4 L 2.6 4 Q 3.1 3.1 2.2 0 Z" fill="#eef3ef" stroke="#07090b" strokeWidth="0.6" />
                                <path d="M -1.5 1.1 L 1.4 1.1 M -1.4 2.1 L 1.2 2.1" stroke="#2dff7a" strokeWidth="0.6" strokeLinecap="round" />
                                <line x1="-2.9" y1="4" x2="2.6" y2="4" stroke="#2dff7a" strokeWidth="1.3" strokeLinecap="round" />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* Right Leg (hip -> knee -> ankle sneaker stays planted on y=0) */}
                    <g transform="translate(4.6, -40)">
                      <g className="dance-leg-r-hip">
                        <path d="M -2.7 0 L -2.3 18.4 L 2.3 18.4 L 2.7 0 Z" fill="#182028" stroke="#07090b" strokeWidth="0.6" />
                        <g transform="translate(0, 18)">
                          <g className="dance-leg-r-knee">
                            <circle cx="0" cy="0" r="2.3" fill="#182028" />
                            <path d="M -2.3 0 L -2.1 18.2 L 2.1 18.2 L 2.3 0 Z" fill="#182028" stroke="#07090b" strokeWidth="0.6" />
                            <g transform="translate(0, 18)">
                              <g className="dance-leg-r-ankle">
                                <path d="M -2.2 0 Q -3.1 3.1 -2.6 4 L 2.9 4 Q 3.4 3 2.5 0 Z" fill="#eef3ef" stroke="#07090b" strokeWidth="0.6" />
                                <path d="M -1.4 1.1 L 1.5 1.1 M -1.2 2.1 L 1.4 2.1" stroke="#2dff7a" strokeWidth="0.6" strokeLinecap="round" />
                                <line x1="-2.6" y1="4" x2="2.9" y2="4" stroke="#2dff7a" strokeWidth="1.3" strokeLinecap="round" />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* Upper body groove wrapper (bounces vertically & sways hips in sync with knees) */}
                    <g className="dance-upper">
                      {/* Hips / Waistband */}
                      <path d="M -7.6 -42 L 7.6 -42 L 7.4 -37 Q 0 -35.5 -7.4 -37 Z" fill="#26313b" stroke="#07090b" strokeWidth="0.55" />

                      {/* Front Hoodie Torso & Neck */}
                      <g>
                        <path d="M -7 -62 C -8.6 -65 -4.8 -67.2 0 -66.6 C 4.8 -67.2 8.6 -65 7 -62 Z" fill="#15221b" stroke="#050907" strokeWidth="0.6" />
                        <path d="M -8.6 -61.5 Q 0 -64.2 8.6 -61.5 L 7.6 -40.2 Q 0 -38.6 -7.6 -40.2 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.7" />
                        <path d="M -8.6 -61.5 L -5.7 -62.2 L -5.2 -40.1 L -7.6 -40.2 Z" fill="#14211a" opacity="0.6" />
                        <path d="M 8.6 -61.5 L 5.7 -62.2 L 5.2 -40.1 L 7.6 -40.2 Z" fill="#14211a" opacity="0.6" />
                        <path d="M -7.6 -42.4 L 7.6 -42.4 L 7.6 -40.2 Q 0 -38.6 -7.6 -40.2 Z" fill="#14211a" />
                        <line x1="-7.6" y1="-42.4" x2="7.6" y2="-42.4" stroke="#2dff7a" strokeWidth="0.6" opacity="0.85" />
                        <path d="M -4.8 -48.5 L 4.8 -48.5 L 5.5 -42.6 L -5.5 -42.6 Z" fill="#17241d" stroke="#0a120d" strokeWidth="0.6" />
                        <text x="0" y="-53.2" textAnchor="middle" fill="#2dff7a" fontFamily="'IBM Plex Mono', monospace" fontSize="4.6" fontWeight="700">&gt;_</text>
                        <path d="M -2.2 -61.5 L -2.4 -55.4" stroke="#c9d6ce" strokeWidth="0.6" strokeLinecap="round" />
                        <circle cx="-2.4" cy="-55" r="0.6" fill="#2dff7a" />
                        <path d="M 2.2 -61.5 L 2.4 -55.4" stroke="#c9d6ce" strokeWidth="0.6" strokeLinecap="round" />
                        <circle cx="2.4" cy="-55" r="0.6" fill="#2dff7a" />
                        <path d="M -1.9 -68.5 L 1.9 -68.5 L 2 -61.5 L -2 -61.5 Z" fill="#e8bf9c" />
                        <path d="M -1.9 -66.5 Q 0 -65 1.9 -66.5 L 1.9 -64.2 Q 0 -63 -1.9 -64.2 Z" fill="#c99a76" opacity="0.7" />
                      </g>

                      {/* Left Articulated Arm (Shoulder -> Elbow -> Hand) */}
                      <g transform="translate(-8.2, -59.5)">
                        <g className="dance-arm-l-sh">
                          <path d="M -2.5 -1 Q -2.8 6 -2.2 11.5 L 2.2 11.5 Q 2.7 6 2.4 -1 Q 0 -3 -2.5 -1 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.6" />
                          <g transform="translate(0, 11.5)">
                            <g className="dance-arm-l-el">
                              <circle cx="0" cy="0" r="2.2" fill="#1d2d24" />
                              <path d="M -2.2 0 Q -2.3 5 -2 9.5 L 2 9.5 Q 2.3 5 2.2 0 Z" fill="#1d2d24" stroke="#050907" strokeWidth="0.6" />
                              <rect x="-2.1" y="8.4" width="4.2" height="1.7" rx="0.6" fill="#14211a" />
                              <line x1="-2.1" y1="8.4" x2="2.1" y2="8.4" stroke="#2dff7a" strokeWidth="0.5" opacity="0.8" />
                              <path d="M -1.9 10.1 L -2.1 12.6 Q -2 14.3 0 14.5 Q 2 14.3 2.1 12.6 L 1.9 10.1 Z" fill="#f2cba8" stroke="#a8724e" strokeWidth="0.4" />
                              <line x1="-1.2" y1="14" x2="-1.5" y2="15.8" stroke="#f2cba8" strokeWidth="1.1" strokeLinecap="round" />
                              <line x1="0.8" y1="14" x2="1.2" y2="15.8" stroke="#f2cba8" strokeWidth="1.1" strokeLinecap="round" />
                            </g>
                          </g>
                        </g>
                      </g>

                      {/* Right Articulated Arm (Shoulder -> Elbow -> Hand) */}
                      <g transform="translate(8.2, -59.5)">
                        <g className="dance-arm-r-sh">
                          <path d="M -2.4 -1 Q -2.7 6 -2.2 11.5 L 2.2 11.5 Q 2.8 6 2.5 -1 Q 0 -3 -2.4 -1 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                          <g transform="translate(0, 11.5)">
                            <g className="dance-arm-r-el">
                              <circle cx="0" cy="0" r="2.2" fill="#22352a" />
                              <path d="M -2.2 0 Q -2.3 5 -2 9.5 L 2 9.5 Q 2.3 5 2.2 0 Z" fill="#22352a" stroke="#050907" strokeWidth="0.6" />
                              <rect x="-2.1" y="8.4" width="4.2" height="1.7" rx="0.6" fill="#14211a" />
                              <line x1="-2.1" y1="8.4" x2="2.1" y2="8.4" stroke="#2dff7a" strokeWidth="0.5" opacity="0.8" />
                              <path d="M -1.9 10.1 L -2.1 12.6 Q -2 14.3 0 14.5 Q 2 14.3 2.1 12.6 L 1.9 10.1 Z" fill="#f2cba8" stroke="#a8724e" strokeWidth="0.4" />
                              <line x1="-0.8" y1="14" x2="-1.2" y2="15.8" stroke="#f2cba8" strokeWidth="1.1" strokeLinecap="round" />
                              <line x1="1.2" y1="14" x2="1.5" y2="15.8" stroke="#f2cba8" strokeWidth="1.1" strokeLinecap="round" />
                            </g>
                          </g>
                        </g>
                      </g>

                      {/* Front-Facing Grooving Head */}
                      <g transform="translate(0, -75)">
                        <g className="dance-head">
                          <path d="M -8.8 3.5 C -10.5 -3 -8.5 -11 0 -11.8 C 8.5 -11 10.5 -3 8.8 3.5 L 5 5 L -5 5 Z" fill="#2e1d13" />
                          <ellipse cx="-7.8" cy="1.2" rx="1.4" ry="2.2" fill="#e8bf9c" stroke="#c48d68" strokeWidth="0.4" />
                          <ellipse cx="7.8" cy="1.2" rx="1.4" ry="2.2" fill="#e8bf9c" stroke="#c48d68" strokeWidth="0.4" />
                          <rect x="-9.1" y="-0.2" width="1.9" height="3.2" rx="0.8" fill="#060908" stroke="#2dff7a" strokeWidth="0.55" />
                          <circle cx="-8.15" cy="1.4" r="0.5" fill="#2dff7a" />
                          <path d="M -7.4 -2 C -7.6 3.5 -4.4 7.4 0 8.5 C 4.4 7.4 7.6 3.5 7.4 -2 C 7.4 -7.2 4.2 -9.6 0 -9.6 C -4.2 -9.6 -7.4 -7.2 -7.4 -2 Z" fill="#f2cba8" />
                          <path d="M -3.5 6.4 Q 0 8.4 3.5 6.4 Q 0 7.7 -3.5 6.4 Z" fill="#d9a986" opacity="0.7" />
                          <ellipse cx="-4.6" cy="2.8" rx="1.4" ry="0.7" fill="#ff8f8f" opacity="0.55" />
                          <ellipse cx="4.6" cy="2.8" rx="1.4" ry="0.7" fill="#ff8f8f" opacity="0.55" />
                          {/* Happy energetic eyes + shine */}
                          <g className="boy-eye-blink">
                            <ellipse cx="-3.1" cy="0.3" rx="1.45" ry="2.1" fill="#2a1a12" />
                            <ellipse cx="-3.1" cy="0.9" rx="0.95" ry="1.15" fill="#2f8f5a" />
                            <circle cx="-2.65" cy="-0.6" r="0.6" fill="#ffffff" />
                            <path d="M -4.8 -1.6 Q -3.1 -2.8 -1.4 -1.6" stroke="#1a0f0a" strokeWidth="0.85" fill="none" strokeLinecap="round" />

                            <ellipse cx="3.1" cy="0.3" rx="1.45" ry="2.1" fill="#2a1a12" />
                            <ellipse cx="3.1" cy="0.9" rx="0.95" ry="1.15" fill="#2f8f5a" />
                            <circle cx="3.55" cy="-0.6" r="0.6" fill="#ffffff" />
                            <path d="M 1.4 -1.6 Q 3.1 -2.8 4.8 -1.6" stroke="#1a0f0a" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                          </g>
                          <path d="M -4.8 -3.5 Q -3.1 -4.6 -1.5 -3.5" stroke="#2e1d13" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                          <path d="M 1.5 -3.5 Q 3.1 -4.6 4.8 -3.5" stroke="#2e1d13" strokeWidth="0.85" fill="none" strokeLinecap="round" />
                          <path d="M -0.3 2.1 L 0.2 2.9 L -0.3 3.2" stroke="#c48d68" strokeWidth="0.45" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Big upbeat dancer grin */}
                          <path d="M -2.7 4.3 Q 0 5.1 2.7 4.3 Q 2 7.3 0 7.3 Q -2 7.3 -2.7 4.3 Z" fill="#6e2620" stroke="#4a1712" strokeWidth="0.4" />
                          <path d="M -1.5 6.2 Q 0 7.2 1.5 6.2" fill="#ff7b86" />
                          {/* Bouncy bangs */}
                          <g className="dance-hair">
                            <path
                              d="M -8.4 1.6 C -9.8 -4.5 -7.5 -10.8 0 -11.6 C 7.5 -10.8 9.8 -4.5 8.4 1.6 L 7.4 2.8 L 6.5 -1.4 L 4.8 -3.6 L 3.4 -0.9 L 1.6 -3.8 L 0 -1.2 L -1.8 -3.8 L -3.5 -0.9 L -4.9 -3.6 L -6.6 -1.3 L -7.4 2.8 Z"
                              fill="#3b2618"
                              stroke="#160d07"
                              strokeWidth="0.55"
                              strokeLinejoin="round"
                            />
                            <path d="M -3.5 -11 L -5.4 -14.2 L -1.2 -11.5 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                            <path d="M 0 -11.5 L 1.8 -14.6 L 3.4 -11 Z" fill="#3b2618" stroke="#160d07" strokeWidth="0.5" strokeLinejoin="round" />
                            <path d="M -4.5 -8.8 Q 0 -10.6 4.5 -8.8" stroke="#7a5236" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.75" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                )}
              </g>

              {/* ---------- FEELING SPEECH BUBBLE (outside the flip, never mirrored) ---------- */}
              <g transform="translate(0, -93)" style={{ pointerEvents: 'none' }}>
                <g className={`feeling-bubble ${bubblePopping ? 'bubble-pop' : ''}`}>
                  <rect x={-bubbleWidth / 2} y="-23" width={bubbleWidth} height="18" rx="6" fill="#060908" stroke="#2dff7a" strokeWidth="1.2" />
                  <polygon points="-4,-5.6 4,-5.6 0,0" fill="#060908" stroke="#2dff7a" strokeWidth="1.2" strokeLinejoin="round" />
                  <line x1="-3.2" y1="-5.6" x2="3.2" y2="-5.6" stroke="#060908" strokeWidth="1.8" />
                  <text x={-bubbleWidth / 2 + 7} y="-11.2" fill="#e6f5ec" fontFamily="'IBM Plex Mono', monospace" fontSize="7.5" fontWeight="700">
                    {currentFeeling}
                  </text>
                  <g transform={`translate(${bubbleWidth / 2 - 14}, -14)`}>
                    <rect x="-10" y="-6" width="20" height="12" rx="3" fill="#2dff7a" />
                    <text x="0" y="2.4" textAnchor="middle" fill="#04120a" fontFamily="'IBM Plex Mono', monospace" fontSize="6.2" fontWeight="800">
                      {activeNode.level}
                    </text>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5. FOOTER ROW: LEGEND, SIMULATOR & START CTA BUTTON               */}
      {/* ================================================================== */}
      <footer className="flex flex-col lg:flex-row items-center justify-between gap-5 pt-1">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#2dff7a] bg-[#2dff7a]/25 shadow-[0_0_8px_rgba(45,255,122,0.6)]" />
            <span>Active milestone</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#22372b] bg-[#0b110e]" />
            <span>Unlocked</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 bg-zinc-900/60 opacity-60" />
            <span>Locked</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 stroke-zinc-400 stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M4 2v20 M4 4c4-2 7 2 11 0v10c-4 2-7-2-11 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Final goal</span>
          </div>
        </div>

        {/* Milestone Walk Navigation Controls (strictly gated by completed categories) */}
        <div className="flex items-center gap-3 bg-[#0e1813]/80 border border-[#22372b] rounded-lg px-3 py-1.5 shadow-inner">
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Path:</span>
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={isWalking || activeNodeIndex >= effectiveMaxUnlockedIndex}
            onClick={() => {
              if (activeNodeIndex < effectiveMaxUnlockedIndex) {
                walkBoyToNode(activeNodeIndex + 1);
              }
            }}
            title={
              activeNodeIndex >= effectiveMaxUnlockedIndex
                ? `Complete ${ROADMAP_NODES[effectiveMaxUnlockedIndex].name} to unlock the next milestone`
                : 'Walk boy to next unlocked milestone'
            }
            className="h-7 text-xs font-mono font-bold text-emerald-400 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 gap-1.5 disabled:opacity-45"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>
              {activeNodeIndex >= effectiveMaxUnlockedIndex
                ? 'Next Milestone Locked'
                : isAdmin && !simulatePlayerLock
                ? 'Admin Walk Next →'
                : 'Walk to Next Unlocked →'}
            </span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isWalking || activeNodeIndex === 0}
            onClick={() => walkBoyToNode(0)}
            className="h-7 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Back to Start</span>
          </Button>
        </div>

        {/* Action Buttons: View Learning Path + Big Neon Start Challenge CTA */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (activeNode.categorySlug === 'all') {
                navigate('/learning-paths');
              } else {
                navigate(`/learning-paths?category=${encodeURIComponent(activeNode.dbCategory)}`);
              }
            }}
            className="w-full sm:w-auto h-[54px] px-5 rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Path</span>
          </button>

          <button
            onClick={() => {
              if (activeNode.categorySlug === 'all') {
                navigate('/challenges');
              } else {
                navigate(`/challenges?category=${activeNode.categorySlug}`);
              }
            }}
            className="w-full sm:w-auto h-[54px] px-8 rounded-md bg-gradient-to-b from-[#38ff82] to-[#20e66b] text-[#04120a] font-mono text-[13.5px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(45,255,122,0.3),0_0_28px_rgba(45,255,122,0.2)] hover:from-[#5eff9c] hover:to-[#2dff7a] hover:shadow-[0_4px_24px_rgba(45,255,122,0.45),0_0_36px_rgba(45,255,122,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
          >
            <span>START: {activeNode.name.toUpperCase()} &rarr;</span>
          </button>
        </div>
      </footer>

      {/* ================================================================== */}
      {/* 4 SUMMARY STAT CARDS (Curated Lessons, Flags, Unlocked, Mastered)  */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
        <div className="rounded-xl bg-[#0b110e] border border-[#22372b] p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Catalog Total</span>
            <BookOpen className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">{totalLessons}</div>
          <p className="text-xs text-zinc-500 font-mono">Curated lessons</p>
        </div>

        <div className="rounded-xl bg-[#0b110e] border border-[#22372b] p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Flags Captured</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">{progress?.solvedChallengesCount ?? 0}</div>
          <p className="text-xs text-zinc-500 font-mono">Challenges conquered</p>
        </div>

        <div className="rounded-xl bg-[#0b110e] border border-[#22372b] p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Unlocked</span>
            <Unlock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">{progress?.unlockedCount ?? 0}</div>
          <p className="text-xs text-zinc-500 font-mono">Ready to study</p>
        </div>

        <div className="rounded-xl bg-[#0b110e] border border-[#22372b] p-4 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">{dynamicCompletedLessons}</div>
          <p className="text-xs text-zinc-500 font-mono">Lessons mastered</p>
        </div>
      </div>
    </div>
  );
};

export default LearningProgressPage;

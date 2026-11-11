import React from 'react';
import { cn } from '@/lib/utils';
import { Difficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: Difficulty | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  className,
  size = 'sm',
}) => {
  const norm = difficulty.toLowerCase();

  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (norm === 'beginner') {
    style = 'bg-sky-950/60 text-sky-400 border-sky-800/50';
  } else if (norm === 'easy') {
    style = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
  } else if (norm === 'medium') {
    style = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
  } else if (norm === 'hard') {
    style = 'bg-rose-950/60 text-rose-400 border-rose-800/50';
  } else if (norm === 'insane' || norm === 'expert') {
    style = 'bg-purple-950/60 text-purple-400 border-purple-800/50';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded border tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        style,
        className
      )}
    >
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;

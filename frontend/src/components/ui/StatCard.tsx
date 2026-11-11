import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: 'green' | 'cyan' | 'amber' | 'purple';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  accentColor = 'green',
  className,
}) => {
  const iconBg = {
    green: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    cyan: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
    amber: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
  }[accentColor];

  return (
    <div
      className={cn(
        'rounded-xl border border-cyber-border bg-cyber-card p-4 transition-all duration-200 hover:border-slate-700 hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-cyber-muted">
          {label}
        </span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-cyber-text">
          {value}
        </span>
        {subValue && (
          <span className="font-mono text-xs text-cyber-muted">
            {subValue}
          </span>
        )}
      </div>
      {trend && (
        <p className="mt-2 text-xs font-mono text-emerald-400">
          {trend}
        </p>
      )}
    </div>
  );
};

export default StatCard;

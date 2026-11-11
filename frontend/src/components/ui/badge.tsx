import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500',
  {
    variants: {
      variant: {
        default:
          'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
        secondary:
          'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700',
        destructive:
          'border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
        outline:
          'border border-slate-700 text-slate-300',
        easy:
          'border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 font-mono',
        medium:
          'border border-amber-500/30 bg-amber-950/40 text-amber-400 font-mono',
        hard:
          'border border-orange-500/30 bg-orange-950/40 text-orange-400 font-mono',
        insane:
          'border border-rose-500/30 bg-rose-950/40 text-rose-400 font-mono font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

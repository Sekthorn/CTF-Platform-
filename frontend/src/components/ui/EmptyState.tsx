import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card/60 p-12 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-border flex items-center justify-center text-cyber-muted">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-sm font-semibold text-cyber-text">{title}</h3>
        <p className="text-xs text-cyber-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="border-cyber-border hover:bg-cyber-elevated text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

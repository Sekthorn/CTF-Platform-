import React from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { mockPracticeLabs } from '@/data/mock/labs';

export const PracticeLabsPage: React.FC = () => {

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Dedicated Practice Labs
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted">
            Isolated target environments for hands-on offensive security drills and exploit development.
          </p>
        </div>
      </div>

      {/* Honest Architectural Status Notice */}
      <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-cyber-text text-sm">
            Lab Orchestration Architecture
          </h2>
          <p className="text-cyber-muted leading-relaxed">
            Target applications are provisioned and solved directly within their dedicated{' '}
            <strong className="text-cyber-text">Challenge Workspaces</strong>. Platform-wide multi-tenant Docker daemon clustering is scheduled in the infrastructure roadmap. Practice without interruption by opening any challenge scenario.
          </p>
        </div>
      </div>

      {/* Available Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockPracticeLabs.map((lab) => (
          <div
            key={lab.id}
            className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
                  {lab.category}
                </span>
                <DifficultyBadge difficulty={lab.difficulty} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-cyber-text">
                  {lab.title}
                </h3>
                <p className="text-xs text-cyber-muted mt-1 line-clamp-3 leading-relaxed">
                  {lab.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="p-3 rounded-lg bg-cyber-elevated/60 border border-cyber-border space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Available in Workspace
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Container Port:</span>
                  <span className="text-cyber-text">{lab.port || 8080}/TCP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Memory Limit:</span>
                  <span className="text-cyber-text">512 MB</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
              <Link to="/challenges">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">
                  <span>Enter Challenge Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeLabsPage;

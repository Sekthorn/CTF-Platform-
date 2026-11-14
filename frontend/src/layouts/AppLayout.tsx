import React, { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const OutletLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[45vh] space-y-2.5 font-mono animate-in fade-in duration-100">
    <div className="w-7 h-7 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
    <span className="text-[11px] text-cyber-muted tracking-wider uppercase">Loading Workspace...</span>
  </div>
);

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('websec_sidebar_collapsed') === 'true';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('websec_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full bg-cyber-bg text-cyber-text overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:px-6 lg:py-4 bg-cyber-bg">
          <div className="w-full max-w-[1720px] mx-auto space-y-4">
            <ErrorBoundary key={location.pathname} resetKey={location.pathname}>
              <Suspense fallback={<OutletLoadingFallback />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

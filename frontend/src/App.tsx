import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';
import AppLayout from '@/layouts/AppLayout';

// Loading fallback with subtle cyberpunk styling for instant transition feedback
const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-mono animate-in fade-in duration-150">
    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
    <span className="text-xs text-cyber-muted tracking-wider uppercase">Loading Cyber Module...</span>
  </div>
);

// Auth & Provisioning Pages (Lazy-loaded for fast initial bundle)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const InitialSetupPage = lazy(() => import('@/pages/auth/InitialSetupPage'));
const AcceptInvitationPage = lazy(() => import('@/pages/auth/AcceptInvitationPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// CTF Player & Platform Pages (Lazy-loaded on demand)
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const ChallengeWorkspacePage = lazy(() => import('@/pages/ChallengeWorkspacePage'));
const LearningPathsPage = lazy(() => import('@/pages/LearningPathsPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DocsPage = lazy(() => import('@/pages/DocsPage'));

// Admin-Only Pages (Lazy-loaded, zero bloat for regular students)
const AdminManagementPage = lazy(() => import('@/pages/admin/AdminManagementPage'));
const AdminKnowledgePage = lazy(() => import('@/pages/admin/AdminKnowledgePage'));

// Security Knowledge & Learning System (Lazy-loaded)
const KnowledgeLibraryPage = lazy(() => import('@/pages/knowledge/KnowledgeLibraryPage'));
const LessonDetailPage = lazy(() => import('@/pages/knowledge/LessonDetailPage'));
const LearningProgressPage = lazy(() => import('@/pages/knowledge/LearningProgressPage'));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Authentication & Setup Routes (Forbidden to authenticated users) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/setup" element={<InitialSetupPage />} />
              <Route path="/admin/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Protected Routes (Accessible by all authenticated players and admins) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />

                {/* Challenges & Workspaces */}
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/challenges/:slug" element={<ChallengeWorkspacePage />} />
                <Route path="/admin/challenges" element={<ChallengesPage />} />
                <Route path="/admin/challenges/:slug" element={<ChallengeWorkspacePage />} />

                {/* Integrated Challenges Redirection */}
                <Route path="/labs" element={<Navigate to="/challenges" replace />} />
                <Route path="/admin/labs" element={<Navigate to="/admin/challenges" replace />} />
                <Route path="/practice-labs" element={<Navigate to="/challenges" replace />} />

                {/* Learning Curriculum, Scoreboard & Community */}
                <Route path="/learning-paths" element={<LearningPathsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/docs" element={<DocsPage />} />

                {/* Security Knowledge & Learning System */}
                <Route path="/knowledge" element={<KnowledgeLibraryPage />} />
                <Route path="/knowledge/:slug" element={<LessonDetailPage />} />
                <Route path="/learning-progress" element={<LearningProgressPage />} />

                {/* Strictly Admin-Only Management Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/knowledge" element={<AdminKnowledgePage />} />
                  <Route path="/admin/admins" element={<AdminManagementPage />} />
                  <Route path="/admin/management" element={<AdminManagementPage />} />
                  <Route path="/admin/audit-logs" element={<AdminManagementPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback Catch-all: Redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

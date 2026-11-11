import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';
import AppLayout from '@/layouts/AppLayout';

// Auth & Provisioning Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import InitialSetupPage from '@/pages/auth/InitialSetupPage';
import AcceptInvitationPage from '@/pages/auth/AcceptInvitationPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// CTF Player & Platform Pages
import DashboardPage from '@/pages/DashboardPage';
import ChallengesPage from '@/pages/ChallengesPage';
import ChallengeWorkspacePage from '@/pages/ChallengeWorkspacePage';
import LearningPathsPage from '@/pages/LearningPathsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import AchievementsPage from '@/pages/AchievementsPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import DocsPage from '@/pages/DocsPage';

// Admin-Only Pages
import AdminManagementPage from '@/pages/admin/AdminManagementPage';
import AdminKnowledgePage from '@/pages/admin/AdminKnowledgePage';

// Security Knowledge & Learning System
import KnowledgeLibraryPage from '@/pages/knowledge/KnowledgeLibraryPage';
import LessonDetailPage from '@/pages/knowledge/LessonDetailPage';
import LearningProgressPage from '@/pages/knowledge/LearningProgressPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

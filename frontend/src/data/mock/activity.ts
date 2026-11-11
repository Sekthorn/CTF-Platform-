import { ActivityItem, UserStats } from '@/types';

export const mockUserStats: UserStats = {
  challengesCompleted: 4,
  totalChallenges: 12,
  totalPoints: 520,
  currentRank: 7,
  totalUsers: 1420,
  learningProgressPercentage: 48,
  streakDays: 5,
};

export const mockRecentActivity: ActivityItem[] = [
  {
    id: 'act-01',
    title: 'Solved "The Ghost Receipt (IDOR)"',
    type: 'challenge_solve',
    points: 150,
    timestamp: '2 hours ago',
    category: 'Broken Access Control',
  },
  {
    id: 'act-02',
    title: 'Completed Lesson: Blind SQL Injections',
    type: 'path_progress',
    points: 25,
    timestamp: '5 hours ago',
    category: 'Injection',
  },
  {
    id: 'act-03',
    title: 'Unlocked "Access Control Breaker"',
    type: 'achievement_unlocked',
    points: 200,
    timestamp: '1 day ago',
    category: 'Achievements',
  },
  {
    id: 'act-04',
    title: 'Solved "Echoes in the DOM"',
    type: 'challenge_solve',
    points: 120,
    timestamp: '2 days ago',
    category: 'Cross-Site Scripting',
  },
  {
    id: 'act-05',
    title: 'Solved "Unionized Infiltration"',
    type: 'challenge_solve',
    points: 100,
    timestamp: '3 days ago',
    category: 'Injection',
  },
];

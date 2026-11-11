export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Insane';

export type ChallengeCategory =
  | 'Authentication & Access Control'
  | 'SQL Injection'
  | 'Cross-Site Scripting (XSS)'
  | 'File Handling & Path Traversal'
  | 'API Security & Server-Side Vulnerabilities'
  | 'Insecure Direct Object Reference (IDOR)'
  | 'Server-Side Request Forgery (SSRF)'
  | 'Command Injection'
  | 'JSON Web Token (JWT)'
  | 'Business Logic Vulnerabilities'
  | 'Insecure Deserialization'
  | string;

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  points: number;
  owaspReference: string;
  cweReference?: string;
  shortDescription: string;
  description?: string;
  instructions?: string;
  objectives?: string;
  solved: boolean;
  solvedCount: number;
  author: string;
  createdAt: string;
  tags: string[];
}

export interface LearningPathReference {
  name: string;
  type: 'OWASP' | 'CWE' | 'NIST' | 'RFC' | 'MITRE' | 'ASVS' | 'WSTG' | string;
  identifier: string;
  url?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  lessonsCount: number;
  challengesCount: number;
  completedLessons: number;
  progressPercentage: number;
  estimatedHours: number;
  iconName: string;
  topics: string[];
  references?: LearningPathReference[];
  targetCategory?: string;
}

export type LabStatus = 'Not Started' | 'Running' | 'Stopped';

export interface PracticeLab {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  status: LabStatus;
  description: string;
  targetUrl?: string;
  port?: number;
  expiresInMinutes?: number;
  activeSince?: string;
  containerId?: string;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  handle: string;
  avatar: string;
  country: string;
  points: number;
  solvedCount: number;
  streakDays: number;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Exploitation' | 'Fundamentals' | 'Streaks' | 'Special';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  progress?: {
    current: number;
    max: number;
  };
}

export interface ActivityItem {
  id: string;
  title: string;
  type: 'challenge_solve' | 'path_progress' | 'lab_started' | 'achievement_unlocked';
  points: number;
  timestamp: string;
  category: string;
}

export interface UserStats {
  challengesCompleted: number;
  totalChallenges: number;
  totalPoints: number;
  currentRank: number;
  totalUsers: number;
  learningProgressPercentage: number;
  streakDays: number;
}

export interface LessonReference {
  title: string;
  url: string;
  type?: string;
}

export interface KnowledgeLessonListItem {
  id: string;
  challengeId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  owaspReference?: string;
  cweReference?: string;
  cvssScore?: number;
  status: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  challenge: {
    id: string;
    title: string;
    slug: string;
    points: number;
    difficulty: Difficulty;
  };
  createdAt: string;
}

export interface KnowledgeLessonDetail {
  id: string;
  challengeId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  owaspReference?: string;
  cweReference?: string;
  cvssScore?: number;
  status: string;
  overview: string;
  rootCause?: string;
  mechanics?: string;
  attackScenario?: string;
  securityImpact?: string;
  prevention?: string;
  vulnerableCode?: string;
  secureCode?: string;
  codeLanguage?: string;
  realWorldExample?: string;
  references: LessonReference[];
  keyTakeaways: string;
  challenge: {
    id: string;
    title: string;
    slug: string;
    points: number;
    difficulty: Difficulty;
    description?: string;
  };
  isUnlocked: boolean;
  isCompleted: boolean;
  lockReason?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProgressItem {
  category: string;
  total: number;
  unlocked: number;
  completed: number;
  completionPercentage: number;
}

export interface KnowledgeProgress {
  totalLessons: number;
  unlockedCount: number;
  completedCount: number;
  solvedChallengesCount: number;
  completionPercentage: number;
  categories: CategoryProgressItem[];
}

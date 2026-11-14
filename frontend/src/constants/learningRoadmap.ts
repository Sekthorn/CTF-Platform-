import { KnowledgeProgress } from '@/types';

export interface RoadmapNode {
  id: string;
  name: string;
  categorySlug: string;
  /** Canonical category value persisted in MySQL `knowledge_lessons.category` */
  dbCategory: string;
  matchTerms: string[];
  lessons: number;
  level: string;
  x: number;
  y: number;
  row: number;
}

export const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'foundations',
    name: 'Web Security Fundamentals',
    categorySlug: 'foundations',
    dbCategory: 'Foundations',
    matchTerms: ['foundations', 'web security fundamentals', 'fundamentals'],
    lessons: 10,
    level: 'LVL 1',
    x: 180,
    y: 120,
    row: 0,
  },
  {
    id: 'auth',
    name: 'Auth & Access Control',
    categorySlug: 'auth-access-control',
    dbCategory: 'auth-access-control',
    matchTerms: ['auth-access-control', 'auth', 'authentication', 'access control'],
    lessons: 11,
    level: 'LVL 2',
    x: 480,
    y: 120,
    row: 0,
  },
  {
    id: 'sqli',
    name: 'SQL Injection',
    categorySlug: 'sql-injection',
    dbCategory: 'sql-injection',
    matchTerms: ['sql-injection', 'sqli', 'sql injection'],
    lessons: 10,
    level: 'LVL 3',
    x: 780,
    y: 120,
    row: 0,
  },
  {
    id: 'xss',
    name: 'Cross Site Scripting',
    categorySlug: 'cross-site-scripting',
    dbCategory: 'cross-site-scripting',
    matchTerms: ['cross-site-scripting', 'xss', 'cross site scripting'],
    lessons: 10,
    level: 'LVL 4',
    x: 1080,
    y: 120,
    row: 0,
  },
  {
    id: 'path',
    name: 'Path Traversal',
    categorySlug: 'file-handling-path-traversal',
    dbCategory: 'file-handling-path-traversal',
    matchTerms: ['path-traversal', 'file-handling', 'file handling', 'traversal'],
    lessons: 10,
    level: 'LVL 5',
    x: 1080,
    y: 300,
    row: 1,
  },
  {
    id: 'api',
    name: 'API Security',
    categorySlug: 'api-security-server-side',
    dbCategory: 'api-security-server-side',
    matchTerms: ['api-security', 'api security', 'api'],
    lessons: 10,
    level: 'LVL 6',
    x: 780,
    y: 300,
    row: 1,
  },
  {
    id: 'idor',
    name: 'IDOR',
    categorySlug: 'idor',
    dbCategory: 'Insecure Direct Object Reference (IDOR)',
    matchTerms: ['idor', 'insecure direct object reference'],
    lessons: 2,
    level: 'LVL 7',
    x: 480,
    y: 300,
    row: 1,
  },
  {
    id: 'ssrf',
    name: 'SSRF',
    categorySlug: 'ssrf',
    dbCategory: 'Server-Side Request Forgery (SSRF)',
    matchTerms: ['ssrf', 'server-side request forgery'],
    lessons: 2,
    level: 'LVL 8',
    x: 180,
    y: 300,
    row: 1,
  },
  {
    id: 'cmd',
    name: 'Command Injection',
    categorySlug: 'command-injection',
    dbCategory: 'Command Injection',
    matchTerms: ['command-injection', 'command injection', 'command'],
    lessons: 2,
    level: 'LVL 9',
    x: 180,
    y: 480,
    row: 2,
  },
  {
    id: 'jwt',
    name: 'JWT',
    categorySlug: 'jwt',
    dbCategory: 'JSON Web Token (JWT)',
    matchTerms: ['jwt', 'json web token'],
    lessons: 2,
    level: 'LVL 10',
    x: 480,
    y: 480,
    row: 2,
  },
  {
    id: 'biz',
    name: 'Business Logic',
    categorySlug: 'business-logic',
    dbCategory: 'Business Logic Vulnerabilities',
    matchTerms: ['business-logic', 'business logic', 'business'],
    lessons: 2,
    level: 'LVL 11',
    x: 780,
    y: 480,
    row: 2,
  },
  {
    id: 'deser',
    name: 'Insecure Deserialization',
    categorySlug: 'insecure-deserialization',
    dbCategory: 'Insecure Deserialization',
    matchTerms: ['deserialization', 'insecure deserialization'],
    lessons: 2,
    level: 'LVL 12',
    x: 1080,
    y: 480,
    row: 2,
  },
  {
    id: 'final',
    name: 'Capture All Flags',
    categorySlug: 'all',
    dbCategory: 'all',
    matchTerms: [],
    lessons: 73,
    level: 'MASTER',
    x: 630,
    y: 650,
    row: 3,
  },
];

export const CATEGORY_COUNT = ROADMAP_NODES.length - 1;
export const FINAL_NODE_INDEX = ROADMAP_NODES.length - 1;

export const NODE_DISTANCES = [
  0,        // Node 0: Foundations (180, 120)
  300,      // Node 1: Auth & Access Control (480, 120)
  600,      // Node 2: SQL Injection (780, 120)
  900,      // Node 3: Cross Site Scripting (1080, 120)
  1182.74,  // Node 4: Path Traversal (1080, 300) [after right arc r=90: +282.74]
  1482.74,  // Node 5: API Security (780, 300)
  1782.74,  // Node 6: IDOR (480, 300)
  2082.74,  // Node 7: SSRF (180, 300)
  2365.49,  // Node 8: Command Injection (180, 480) [after left arc r=90: +282.74]
  2665.49,  // Node 9: JWT (480, 480)
  2965.49,  // Node 10: Business Logic (780, 480)
  3265.49,  // Node 11: Insecure Deserialization (1080, 480)
  3982.52,  // Node 12: Capture All Flags (630, 650) [after right arc r=85: +267.04, then -450px]
];

export const TOTAL_PATH_LENGTH = 3982.52;

/** Match a raw lesson/progress category string to its roadmap milestone node. */
export function findRoadmapNodeForCategory(category: string | undefined): RoadmapNode | undefined {
  if (!category) return undefined;
  const raw = category.toLowerCase();
  const normalized = raw.replace(/[^a-z0-9]/g, '');
  return ROADMAP_NODES.slice(0, CATEGORY_COUNT).find((node) =>
    node.matchTerms.some(
      (term) =>
        raw === term ||
        raw.includes(term) ||
        normalized === term.replace(/[^a-z0-9]/g, '')
    )
  );
}

/** Resolve any stored or display category name to its canonical database category string. */
export function getCanonicalDbCategory(category: string): string {
  return findRoadmapNodeForCategory(category)?.dbCategory ?? category;
}

/** Match backend category analytics by exact/substring name (works for both Foundations and Roadmap LVL 1-11). */
export function getDynamicCategoryStats(
  categories: KnowledgeProgress['categories'] | undefined,
  categoryName: string,
  fallbackTotal = 0
) {
  if (!categories) {
    return { completed: 0, total: fallbackTotal, pct: 0, isCompleted: false };
  }
  const rawTarget = categoryName.toLowerCase();
  const normTarget = rawTarget.replace(/[^a-z0-9]/g, '');
  const found = categories.find((c) => {
    const raw = (c.category || '').toLowerCase();
    const norm = raw.replace(/[^a-z0-9]/g, '');
    return raw === rawTarget || raw.includes(rawTarget) || rawTarget.includes(raw) || norm === normTarget;
  });
  if (!found) {
    const total = categories.length > 0 ? 0 : fallbackTotal;
    return { completed: 0, total, pct: 0, isCompleted: false };
  }
  const total = found.total ?? 0;
  const pct = found.completionPercentage ?? 0;
  const isCompleted = total > 0 && (pct >= 100 || found.completed >= total);
  return { completed: found.completed, total, pct, isCompleted };
}

/** Match backend category analytics to a roadmap milestone node reliably. */
export function getNodeCategoryStats(
  categories: KnowledgeProgress['categories'] | undefined,
  node: RoadmapNode
) {
  if (!categories) {
    return { completed: 0, total: node.lessons, pct: 0, isCompleted: false };
  }
  if (node.matchTerms.length === 0) {
    return { completed: 0, total: 0, pct: 0, isCompleted: false };
  }
  const found = categories.find((c) => {
    const raw = (c.category || '').toLowerCase();
    return node.matchTerms.some((term) => raw === term || raw.includes(term));
  });
  if (!found) {
    // When backend data is loaded, a missing category truly has 0 published lessons
    const total = categories.length > 0 ? 0 : node.lessons;
    return { completed: 0, total, pct: 0, isCompleted: false };
  }
  const total = found.total ?? 0;
  const pct = found.completionPercentage ?? 0;
  const isCompleted = total > 0 && (pct >= 100 || found.completed >= total);
  return { completed: found.completed, total, pct, isCompleted };
}

/** Sequential unlock frontier: first incomplete category (0..11), or 12 when all 12 categories are mastered. */
export function getSequentialUnlockedIndex(
  categories: KnowledgeProgress['categories'] | undefined
): number {
  let unlocked = 0;
  for (let i = 0; i < CATEGORY_COUNT; i++) {
    if (getNodeCategoryStats(categories, ROADMAP_NODES[i]).isCompleted) {
      unlocked = i + 1;
    } else {
      break;
    }
  }
  return unlocked;
}

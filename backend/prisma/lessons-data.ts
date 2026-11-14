import { LessonSeedData } from './lessons/auth-lessons';
import { FOUNDATIONS_LESSONS } from './lessons/foundations-lessons';
import { AUTH_LESSONS } from './lessons/auth-lessons';
import { SQLI_LESSONS } from './lessons/sqli-lessons';
import { XSS_LESSONS } from './lessons/xss-lessons';
import { FILE_LESSONS } from './lessons/file-lessons';
import { API_LESSONS } from './lessons/api-lessons';
import { NEW_BATCH1_LESSONS } from './lessons/batch-lessons-data';
import { NEW_BATCH2_LESSONS } from './lessons/batch2-lessons-data';
import { NEW_BATCH3_LESSONS } from './lessons/batch3-lessons-data';

export * from './lessons/auth-lessons';

export const ALL_50_LESSONS: LessonSeedData[] = [
  ...FOUNDATIONS_LESSONS,
  ...AUTH_LESSONS,
  ...SQLI_LESSONS,
  ...XSS_LESSONS,
  ...FILE_LESSONS,
  ...API_LESSONS,
  ...NEW_BATCH1_LESSONS,
  ...NEW_BATCH2_LESSONS,
  ...NEW_BATCH3_LESSONS,
];

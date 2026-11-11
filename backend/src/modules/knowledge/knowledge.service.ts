import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryLessonsDto } from './dto/query-lessons.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import {
  ChallengeDifficulty,
  ChallengeStatus,
  ProgressStatus,
  UserRole,
  Prisma,
} from '@prisma/client';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve list of lessons with user unlock & completion status
   */
  async getLessons(userId: string, userRole: string, query: QueryLessonsDto) {
    const {
      category,
      difficulty,
      status,
      search,
      page = 1,
      limit = 50,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.KnowledgeLessonWhereInput = {
      ...(category ? { category } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(status
        ? { status }
        : userRole === UserRole.ADMIN
          ? {}
          : { status: ChallengeStatus.PUBLISHED }),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { owaspReference: { contains: search } },
              { cweReference: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, lessons] = await Promise.all([
      this.prisma.knowledgeLesson.count({ where }),
      this.prisma.knowledgeLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              slug: true,
              points: true,
              difficulty: true,
            },
          },
          userProgress: {
            where: { userId },
            select: {
              status: true,
              completedAt: true,
            },
          },
        },
      }),
    ]);

    // Check user solved challenges to determine unlock status
    const solvedProgress = await this.prisma.userChallengeProgress.findMany({
      where: {
        userId,
        status: ProgressStatus.SOLVED,
      },
      select: { challengeId: true },
    });
    const solvedChallengeIds = new Set(
      solvedProgress.map((p) => p.challengeId),
    );
    const isAdmin = userRole === UserRole.ADMIN;

    const items = lessons.map((lesson) => {
      const isChallengeSolved = solvedChallengeIds.has(lesson.challengeId);
      const isUnlocked = isAdmin || isChallengeSolved;
      const progress = lesson.userProgress[0];
      const isCompleted = progress?.status === ProgressStatus.SOLVED;

      return {
        id: lesson.id,
        challengeId: lesson.challengeId,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        category: lesson.category,
        difficulty: lesson.difficulty,
        owaspReference: lesson.owaspReference,
        cweReference: lesson.cweReference,
        cvssScore: lesson.cvssScore,
        status: lesson.status,
        challenge: lesson.challenge,
        isUnlocked,
        isCompleted,
        completedAt: progress?.completedAt || null,
        createdAt: lesson.createdAt,
      };
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve single lesson by slug
   * Protects solution details if challenge is not solved yet
   */
  async getLessonBySlug(userId: string, userRole: string, slug: string) {
    const lesson = await this.prisma.knowledgeLesson.findUnique({
      where: { slug },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
            points: true,
            difficulty: true,
            description: true,
          },
        },
        userProgress: {
          where: { userId },
          select: {
            status: true,
            completedAt: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with slug '${slug}' not found`);
    }

    const isAdmin = userRole === UserRole.ADMIN;
    let isUnlocked = isAdmin;

    if (!isUnlocked) {
      const challengeProgress =
        await this.prisma.userChallengeProgress.findUnique({
          where: {
            userId_challengeId: {
              userId,
              challengeId: lesson.challengeId,
            },
          },
        });
      isUnlocked = challengeProgress?.status === ProgressStatus.SOLVED;
    }

    const progress = lesson.userProgress[0];
    const isCompleted = progress?.status === ProgressStatus.SOLVED;

    let parsedReferences = [];
    try {
      parsedReferences = JSON.parse(lesson.referencesJson || '[]');
    } catch {
      parsedReferences = [];
    }

    // Server-side solution protection:
    // If locked, withhold solution details to avoid spoiling the CTF challenge
    if (!isUnlocked) {
      return {
        id: lesson.id,
        challengeId: lesson.challengeId,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        category: lesson.category,
        difficulty: lesson.difficulty,
        owaspReference: lesson.owaspReference,
        cweReference: lesson.cweReference,
        cvssScore: lesson.cvssScore,
        status: lesson.status,
        overview: lesson.overview,
        challenge: lesson.challenge,
        isUnlocked: false,
        isCompleted: false,
        lockReason:
          'Solve the linked challenge in the CTF arena to unlock this security knowledge guide.',
        references: parsedReferences,
        keyTakeaways: lesson.keyTakeaways,
      };
    }

    return {
      id: lesson.id,
      challengeId: lesson.challengeId,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      owaspReference: lesson.owaspReference,
      cweReference: lesson.cweReference,
      cvssScore: lesson.cvssScore,
      status: lesson.status,
      overview: lesson.overview,
      rootCause: lesson.rootCause,
      mechanics: lesson.mechanics,
      attackScenario: lesson.attackScenario,
      securityImpact: lesson.securityImpact,
      prevention: lesson.prevention,
      vulnerableCode: lesson.vulnerableCode,
      secureCode: lesson.secureCode,
      codeLanguage: lesson.codeLanguage,
      realWorldExample: lesson.realWorldExample,
      references: parsedReferences,
      keyTakeaways: lesson.keyTakeaways,
      challenge: lesson.challenge,
      isUnlocked: true,
      isCompleted,
      completedAt: progress?.completedAt || null,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }

  /**
   * Mark a lesson as completed
   */
  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.knowledgeLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${lessonId}' not found`);
    }

    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status: ProgressStatus.SOLVED,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        status: ProgressStatus.SOLVED,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Lesson marked as completed!',
      completedAt: progress.completedAt,
    };
  }

  /**
   * Get learning progress analytics for current user
   */
  async getUserProgress(userId: string, userRole?: string) {
    const [totalLessons, userLessonProgresses, solvedChallenges, allLessons] =
      await Promise.all([
        this.prisma.knowledgeLesson.count({
          where: { status: ChallengeStatus.PUBLISHED },
        }),
        this.prisma.userLessonProgress.findMany({
          where: { userId },
        }),
        this.prisma.userChallengeProgress.findMany({
          where: { userId, status: ProgressStatus.SOLVED },
          select: { challengeId: true },
        }),
        this.prisma.knowledgeLesson.findMany({
          where: { status: ChallengeStatus.PUBLISHED },
          select: { id: true, category: true, challengeId: true },
        }),
      ]);

    const isAdmin = userRole === UserRole.ADMIN;
    const solvedChallengeIds = new Set(
      solvedChallenges.map((s) => s.challengeId),
    );
    const completedLessonIds = new Set(
      userLessonProgresses
        .filter((p) => p.status === ProgressStatus.SOLVED)
        .map((p) => p.lessonId),
    );

    let unlockedCount = 0;
    let completedCount = 0;

    const categoryMap = new Map<
      string,
      { total: number; unlocked: number; completed: number }
    >();

    for (const l of allLessons) {
      const isUnlocked = isAdmin || solvedChallengeIds.has(l.challengeId);
      const isCompleted = completedLessonIds.has(l.id);

      if (isUnlocked) unlockedCount++;
      if (isCompleted) completedCount++;

      const catStats = categoryMap.get(l.category) || {
        total: 0,
        unlocked: 0,
        completed: 0,
      };
      catStats.total += 1;
      if (isUnlocked) catStats.unlocked += 1;
      if (isCompleted) catStats.completed += 1;
      categoryMap.set(l.category, catStats);
    }

    const categories = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category,
        ...stats,
        completionPercentage:
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0,
      }),
    );

    return {
      totalLessons,
      unlockedCount,
      completedCount,
      solvedChallengesCount: solvedChallenges.length,
      completionPercentage:
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0,
      categories,
    };
  }

  /**
   * Admin: Create a new knowledge lesson
   */
  async createLesson(dto: CreateLessonDto) {
    const existing = await this.prisma.knowledgeLesson.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { challengeId: dto.challengeId }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'A lesson with this slug or linked to this challenge already exists',
      );
    }

    return this.prisma.knowledgeLesson.create({
      data: {
        challengeId: dto.challengeId,
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty || ChallengeDifficulty.BEGINNER,
        owaspReference: dto.owaspReference,
        cweReference: dto.cweReference,
        cvssScore: dto.cvssScore,
        status: dto.status || ChallengeStatus.PUBLISHED,
        overview: dto.overview,
        rootCause: dto.rootCause,
        mechanics: dto.mechanics,
        attackScenario: dto.attackScenario,
        securityImpact: dto.securityImpact,
        prevention: dto.prevention,
        vulnerableCode: dto.vulnerableCode,
        secureCode: dto.secureCode,
        codeLanguage: dto.codeLanguage || 'typescript',
        realWorldExample: dto.realWorldExample,
        referencesJson: dto.referencesJson || '[]',
        keyTakeaways: dto.keyTakeaways,
      },
    });
  }

  /**
   * Admin: Update an existing lesson
   */
  async updateLesson(id: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.knowledgeLesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${id}' not found`);
    }

    return this.prisma.knowledgeLesson.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Admin: Delete a lesson
   */
  async deleteLesson(id: string) {
    const lesson = await this.prisma.knowledgeLesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${id}' not found`);
    }

    return this.prisma.knowledgeLesson.delete({
      where: { id },
    });
  }
}

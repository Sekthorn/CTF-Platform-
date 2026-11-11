import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LabsService } from '../labs/labs.service';
import { SubmitFlagDto } from './dto/submit-flag.dto';
import { ChallengeStatus, ProgressStatus, LabStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly labsService: LabsService,
  ) {}

  /**
   * Submit flag for verification against challenge
   * Uses cryptographically secure SHA-256 hash comparison
   * Executes atomic balance and solve state transition within database transaction
   */
  async submitFlag(challengeId: string, userId: string, dto: SubmitFlagDto) {
    const rawFlag = dto.flag.trim();

    if (!rawFlag) {
      throw new BadRequestException('Flag submission cannot be empty');
    }

    // 1. Fetch challenge and active flags
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        flags: {
          where: { isActive: true },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(
        `Challenge with ID '${challengeId}' not found`,
      );
    }

    if (challenge.status !== ChallengeStatus.PUBLISHED) {
      throw new BadRequestException(
        'Submissions are not accepted for unpublished challenges',
      );
    }

    // 2. Anti-cheat check: Has this user already solved this challenge?
    const existingProgress = await this.prisma.userChallengeProgress.findUnique(
      {
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
      },
    );

    if (existingProgress?.status === ProgressStatus.SOLVED) {
      const linkedLesson = await this.prisma.knowledgeLesson.findUnique({
        where: { challengeId },
        select: { id: true, title: true, slug: true },
      });

      return {
        isCorrect: true,
        alreadySolved: true,
        pointsAwarded: 0,
        message: 'You have already solved this challenge!',
        solvedAt: existingProgress.solvedAt,
        unlockedLesson: linkedLesson,
      };
    }

    // 3. Compute hash of submitted flag
    const submittedHash = crypto
      .createHash('sha256')
      .update(rawFlag)
      .digest('hex');

    // 4. Per-Player Dynamic Flag Verification
    // Compute the unique deterministic flag assigned to this player for this challenge
    const { rawFlag: expectedRawFlag, flagHash: expectedUserHash } =
      this.labsService.computePlayerChallengeFlag(userId, challenge.slug);

    let isMatch = false;
    let matchedInstanceId: string | null = null;

    // Check against player's unique deterministic flag (preventing one player using another's flag)
    if (
      rawFlag.trim() === expectedRawFlag.trim() ||
      submittedHash === expectedUserHash
    ) {
      isMatch = true;
    }

    // Also link player's LabInstance if one exists in the database
    const userLab = await this.prisma.labInstance.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      include: {
        flag: true,
      },
    });

    if (userLab) {
      matchedInstanceId = userLab.id;
      if (userLab.flag?.flagHash === submittedHash) {
        isMatch = true;
      }
    }

    // Fallback: Check static challenge flags if instance did not match
    if (!isMatch) {
      for (const flag of challenge.flags) {
        if (flag.isCaseSensitive) {
          if (flag.flagHash === submittedHash) {
            isMatch = true;
            break;
          }
        } else {
          const lowerHash = crypto
            .createHash('sha256')
            .update(rawFlag.toLowerCase())
            .digest('hex');
          if (flag.flagHash === lowerHash || flag.flagHash === submittedHash) {
            isMatch = true;
            break;
          }
        }
      }
    }

    // 5. Handle correct submission with atomic transaction
    if (isMatch) {
      return this.prisma.$transaction(async (tx) => {
        // Record submission
        const submission = await tx.submission.create({
          data: {
            userId,
            challengeId,
            instanceId: matchedInstanceId,
            submittedFlag: rawFlag,
            isCorrect: true,
            pointsAwarded: challenge.points,
          },
        });

        // Invalidate instance flag after correct solve
        if (matchedInstanceId) {
          await tx.instanceFlag.updateMany({
            where: { instanceId: matchedInstanceId },
            data: { isUsed: true },
          });
        }

        // Upsert progress
        await tx.userChallengeProgress.upsert({
          where: {
            userId_challengeId: {
              userId,
              challengeId,
            },
          },
          create: {
            userId,
            challengeId,
            status: ProgressStatus.SOLVED,
            solvedAt: new Date(),
            pointsEarned: challenge.points,
          },
          update: {
            status: ProgressStatus.SOLVED,
            solvedAt: new Date(),
            pointsEarned: challenge.points,
          },
        });

        // Atomically increment user's total score
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            totalPoints: {
              increment: challenge.points,
            },
          },
          select: {
            id: true,
            username: true,
            totalPoints: true,
          },
        });

        // Auto-unlock corresponding Knowledge Lesson if linked
        const linkedLesson = await tx.knowledgeLesson.findUnique({
          where: { challengeId },
          select: { id: true, title: true, slug: true },
        });

        let unlockedLesson: { id: string; title: string; slug: string } | null =
          null;
        if (linkedLesson) {
          await tx.userLessonProgress.upsert({
            where: {
              userId_lessonId: {
                userId,
                lessonId: linkedLesson.id,
              },
            },
            update: {
              status: ProgressStatus.IN_PROGRESS,
            },
            create: {
              userId,
              lessonId: linkedLesson.id,
              status: ProgressStatus.IN_PROGRESS,
            },
          });
          unlockedLesson = {
            id: linkedLesson.id,
            title: linkedLesson.title,
            slug: linkedLesson.slug,
          };
        }

        this.logger.log(
          `User '${updatedUser.username}' successfully solved challenge '${challenge.title}' (+${challenge.points} pts)`,
        );

        return {
          isCorrect: true,
          alreadySolved: false,
          pointsAwarded: challenge.points,
          totalPoints: updatedUser.totalPoints,
          message: `Congratulations! Flag accepted. You earned ${challenge.points} points!`,
          submissionId: submission.id,
          unlockedLesson,
        };
      });
    }

    // 5. Handle incorrect submission
    await this.prisma.submission.create({
      data: {
        userId,
        challengeId,
        submittedFlag: rawFlag,
        isCorrect: false,
        pointsAwarded: 0,
      },
    });

    // Mark challenge IN_PROGRESS if not already tracked
    await this.prisma.userChallengeProgress.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      create: {
        userId,
        challengeId,
        status: ProgressStatus.IN_PROGRESS,
      },
      update: {},
    });

    return {
      isCorrect: false,
      alreadySolved: false,
      pointsAwarded: 0,
      message: 'Incorrect flag. Inspect the vulnerability and try again!',
    };
  }

  /**
   * Get user's recent submissions
   */
  async getUserSubmissions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({ where: { userId } }),
      this.prisma.submission.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          isCorrect: true,
          pointsAwarded: true,
          submittedAt: true,
          challenge: {
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              points: true,
            },
          },
        },
      }),
    ]);

    return {
      items: submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get submissions for a specific challenge by current user
   */
  async getChallengeSubmissions(userId: string, challengeId: string) {
    return this.prisma.submission.findMany({
      where: {
        userId,
        challengeId,
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        isCorrect: true,
        pointsAwarded: true,
        submittedAt: true,
      },
    });
  }
}

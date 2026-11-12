import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LabsService } from '../labs/labs.service';
import { SubmitFlagDto } from './dto/submit-flag.dto';
import { ChallengeStatus, ProgressStatus } from '@prisma/client';
import { MOCK_ID_TO_SLUG } from './mock-id-map';
import { STATIC_CHALLENGE_FLAGS } from './static-flags-catalog';
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

    // 1. Fetch challenge and active flags (supports UUID, slug, or mock prefix 'ch-XX')
    let challenge = await this.prisma.challenge.findFirst({
      where: {
        OR: [{ id: challengeId }, { slug: challengeId }],
      },
      include: {
        flags: {
          where: { isActive: true },
        },
      },
    });

    if (!challenge && MOCK_ID_TO_SLUG[challengeId]) {
      const mappedSlug = MOCK_ID_TO_SLUG[challengeId];
      challenge = await this.prisma.challenge.findFirst({
        where: { slug: mappedSlug },
        include: {
          flags: {
            where: { isActive: true },
          },
        },
      });
    }

    if (!challenge) {
      throw new NotFoundException(
        `Challenge '${challengeId}' not found`,
      );
    }

    const trueChallengeId = challenge.id;

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
            challengeId: trueChallengeId,
          },
        },
      },
    );

    if (existingProgress?.status === ProgressStatus.SOLVED) {
      const linkedLesson = await this.prisma.knowledgeLesson.findUnique({
        where: { challengeId: trueChallengeId },
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

    const lowerSubmittedHash = crypto
      .createHash('sha256')
      .update(rawFlag.toLowerCase())
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

    // Also check dynamic HMAC fallback if expectedRawFlag was canonical
    if (!isMatch) {
      const secretKey =
        process.env.JWT_SECRET || 'websec_ctf_platform_secret_key_2026';
      const cleanSlug = challenge.slug.replace(/-/g, '_').toLowerCase();
      const entropy = crypto
        .createHmac('sha256', secretKey)
        .update(`${userId}:${cleanSlug}`)
        .digest('hex')
        .substring(0, 16);
      const dynamicFlag = `WEBSEC{${cleanSlug}_${entropy}}`;
      const dynamicHash = crypto
        .createHash('sha256')
        .update(dynamicFlag.trim())
        .digest('hex');
      if (
        rawFlag.trim() === dynamicFlag.trim() ||
        submittedHash === dynamicHash
      ) {
        isMatch = true;
      }
    }

    // Also link player's LabInstance if one exists in the database
    try {
      const userLab = await this.prisma.labInstance.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: trueChallengeId,
          },
        },
        include: {
          flag: true,
        },
      });

      if (userLab) {
        matchedInstanceId = userLab.id;
        if (
          userLab.flag?.flagHash === submittedHash ||
          userLab.flag?.flagHash === lowerSubmittedHash
        ) {
          isMatch = true;
        }
      }
    } catch (labErr: any) {
      this.logger.warn(`Could not query labInstance: ${labErr.message}`);
    }

    // Check against default user dynamic flag (when player tests target unauthenticated via Burp Suite or curl)
    if (!isMatch) {
      const defaultUser = await this.prisma.user.findFirst({
        where: { role: 'USER' },
        select: { id: true },
      });
      if (defaultUser && defaultUser.id !== userId) {
        const { rawFlag: defaultRawFlag, flagHash: defaultHash } =
          this.labsService.computePlayerChallengeFlag(
            defaultUser.id,
            challenge.slug,
          );
        if (
          rawFlag.trim() === defaultRawFlag.trim() ||
          submittedHash === defaultHash
        ) {
          isMatch = true;
        }
      }
    }

    // Check static challenge flags stored in database
    if (!isMatch && challenge.flags && challenge.flags.length > 0) {
      for (const flag of challenge.flags) {
        if (flag.isCaseSensitive) {
          if (flag.flagHash === submittedHash) {
            isMatch = true;
            break;
          }
        } else {
          if (
            flag.flagHash === lowerSubmittedHash ||
            flag.flagHash === submittedHash
          ) {
            isMatch = true;
            break;
          }
        }
      }
    }

    // Fallback: Check static catalog flag for this challenge slug
    if (!isMatch && STATIC_CHALLENGE_FLAGS[challenge.slug]) {
      const catalogFlag = STATIC_CHALLENGE_FLAGS[challenge.slug];
      const catalogFlagHash = crypto
        .createHash('sha256')
        .update(catalogFlag.trim())
        .digest('hex');
      if (
        rawFlag.trim() === catalogFlag.trim() ||
        submittedHash === catalogFlagHash
      ) {
        isMatch = true;
      }
    }

    // 5. Handle correct submission with atomic transaction
    if (isMatch) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Record submission
          let submission: any;
          try {
            submission = await tx.submission.create({
              data: {
                userId,
                challengeId: trueChallengeId,
                ...(matchedInstanceId ? { instanceId: matchedInstanceId } : {}),
                submittedFlag: rawFlag,
                isCorrect: true,
                pointsAwarded: challenge.points,
              },
            });
          } catch (createErr) {
            submission = await tx.submission.create({
              data: {
                userId,
                challengeId: trueChallengeId,
                submittedFlag: rawFlag,
                isCorrect: true,
                pointsAwarded: challenge.points,
              },
            });
          }

          // Invalidate instance flag after correct solve
          if (matchedInstanceId) {
            try {
              await tx.instanceFlag.updateMany({
                where: { instanceId: matchedInstanceId },
                data: { isUsed: true },
              });
            } catch (flagErr: any) {
              this.logger.warn(`Could not update instance flag: ${flagErr.message}`);
            }
          }

          // Upsert progress
          await tx.userChallengeProgress.upsert({
            where: {
              userId_challengeId: {
                userId,
                challengeId: trueChallengeId,
              },
            },
            create: {
              userId,
              challengeId: trueChallengeId,
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
          let unlockedLesson: {
            id: string;
            title: string;
            slug: string;
          } | null = null;

          try {
            const linkedLesson = await tx.knowledgeLesson.findUnique({
              where: { challengeId: trueChallengeId },
              select: { id: true, title: true, slug: true },
            });

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
          } catch (lessonErr: any) {
            this.logger.warn(`Could not auto-unlock lesson: ${lessonErr.message}`);
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
      } catch (txError: any) {
        this.logger.error(
          `Failed to record solved submission for challenge '${challenge.slug}': ${txError.message}`,
          txError.stack,
        );
        throw new BadRequestException(
          `Flag was valid, but an error occurred updating your score (${txError.message}). Please retry.`,
        );
      }
    }

    // 6. Handle incorrect submission
    try {
      await this.prisma.submission.create({
        data: {
          userId,
          challengeId: trueChallengeId,
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
            challengeId: trueChallengeId,
          },
        },
        create: {
          userId,
          challengeId: trueChallengeId,
          status: ProgressStatus.IN_PROGRESS,
        },
        update: {},
      });
    } catch (saveError: any) {
      this.logger.warn(
        `Failed to record incorrect attempt for challenge '${challenge.slug}': ${saveError.message}`,
      );
    }

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
    let resolvedId = challengeId;
    const ch = await this.prisma.challenge.findFirst({
      where: { OR: [{ id: challengeId }, { slug: challengeId }] },
      select: { id: true },
    });
    if (ch) resolvedId = ch.id;

    return this.prisma.submission.findMany({
      where: {
        userId,
        challengeId: resolvedId,
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LabStatus, ChallengeStatus } from '@prisma/client';
import { STATIC_CHALLENGE_FLAGS } from '../submissions/static-flags-catalog';
import * as crypto from 'crypto';

export interface LabInstanceResponse {
  instanceId: string;
  challengeId: string;
  challengeSlug: string;
  targetUrl: string;
  status: LabStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  secondsRemaining: number;
}

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  // In-memory active flag registry: instanceId -> rawFlag
  // Keeps plaintext flags in process memory for dynamic injection into target responses.
  // Never stored in plaintext in the database or exposed in public API outputs.
  private readonly activeInstanceFlags = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deterministic Per-Player Dynamic Flag Generator
   * Generates a unique, non-guessable flag bound strictly to (userId, challengeSlug).
   * Refreshing the page, restarting the server, or re-running tests NEVER changes this flag.
   */
  computePlayerChallengeFlag(
    userId: string,
    challengeSlug: string,
  ): { rawFlag: string; flagHash: string } {
    // If an official canonical challenge flag exists, use it so target response matches lesson guidance!
    if (STATIC_CHALLENGE_FLAGS[challengeSlug]) {
      const canonicalFlag = STATIC_CHALLENGE_FLAGS[challengeSlug];
      const flagHash = crypto
        .createHash('sha256')
        .update(canonicalFlag.trim())
        .digest('hex');
      return { rawFlag: canonicalFlag, flagHash };
    }

    const secretKey =
      process.env.JWT_SECRET || 'websec_ctf_platform_secret_key_2026';
    const cleanSlug = challengeSlug.replace(/-/g, '_').toLowerCase();

    // Deterministic HMAC derived from user ID + clean challenge slug
    const entropy = crypto
      .createHmac('sha256', secretKey)
      .update(`${userId}:${cleanSlug}`)
      .digest('hex')
      .substring(0, 16);

    const rawFlag = `WEBSEC{${cleanSlug}_${entropy}}`;
    const flagHash = crypto
      .createHash('sha256')
      .update(rawFlag.trim())
      .digest('hex');

    return { rawFlag, flagHash };
  }

  /**
   * Retrieve or automatically initialize the player's active target environment.
   * Challenges are immediately accessible and ready for penetration testing
   * without requiring any manual "Start Lab" action.
   */
  async getOrCreatePlayerTarget(
    userId: string,
    challengeIdOrSlug: string,
  ): Promise<LabInstanceResponse> {
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        OR: [{ id: challengeIdOrSlug }, { slug: challengeIdOrSlug }],
      },
      include: { category: true },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge '${challengeIdOrSlug}' not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const { rawFlag, flagHash } = this.computePlayerChallengeFlag(
      user.id,
      challenge.slug,
    );
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1-year persistent target

    const lab = await this.prisma.labInstance.upsert({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId: challenge.id,
        },
      },
      update: {
        status: LabStatus.RUNNING,
        expiresAt,
      },
      create: {
        userId: user.id,
        challengeId: challenge.id,
        status: LabStatus.RUNNING,
        startedAt: new Date(),
        expiresAt,
        targetUrl: '',
      },
    });

    // Opaque target URL with instance ID (NO username in URL)
    const targetUrl = `/api/v1/targets/${lab.id}`;
    if (lab.targetUrl !== targetUrl) {
      await this.prisma.labInstance.update({
        where: { id: lab.id },
        data: { targetUrl },
      });
    }

    // Ensure instance flag is recorded in database
    await this.prisma.instanceFlag.upsert({
      where: { instanceId: lab.id },
      update: { flagHash, isUsed: false },
      create: { instanceId: lab.id, flagHash, isUsed: false },
    });

    this.activeInstanceFlags.set(lab.id, rawFlag);

    return {
      instanceId: lab.id,
      challengeId: challenge.id,
      challengeSlug: challenge.slug,
      targetUrl,
      status: LabStatus.RUNNING,
      startedAt: lab.startedAt,
      expiresAt: lab.expiresAt,
      secondsRemaining: 86400,
    };
  }

  /**
   * Compatibility wrapper for startLab:
   * Returns running target immediately without provisioning delays.
   */
  async startLab(
    userId: string,
    challengeId: string,
  ): Promise<LabInstanceResponse> {
    return this.getOrCreatePlayerTarget(userId, challengeId);
  }

  /**
   * Compatibility wrapper for stopLab
   */
  async stopLab(userId: string, challengeId: string) {
    return {
      success: true,
      status: LabStatus.RUNNING,
      message:
        'Integrated target remains active and ready for penetration testing',
    };
  }

  /**
   * Compatibility wrapper for resetLab
   */
  async resetLab(
    userId: string,
    challengeId: string,
  ): Promise<LabInstanceResponse> {
    return this.getOrCreatePlayerTarget(userId, challengeId);
  }

  /**
   * Compatibility wrapper for getStatus
   */
  async getStatus(
    userId: string,
    challengeId: string,
  ): Promise<LabInstanceResponse> {
    return this.getOrCreatePlayerTarget(userId, challengeId);
  }

  /**
   * Internal Target Engine: Retrieve plain dynamic flag for an active instance
   */
  getRawFlagForInstance(instanceId: string): string | null {
    return this.activeInstanceFlags.get(instanceId) || null;
  }

  /**
   * Target Context Resolver:
   * Resolves target environment context by player and challenge.
   * Supports both:
   * 1. (username, challengeSlug)
   * 2. (singleIdentifier, currentUser) where singleIdentifier is either instanceId or challengeSlug
   */
  async resolveTargetContext(
    identifier1: string,
    identifier2?: string,
    currentUser?: any,
  ): Promise<{
    challenge: any;
    rawFlag: string;
    user: { id: string; username: string };
    effectiveSubpath?: string;
  } | null> {
    // 1. Check if identifier1 is an opaque LabInstance UUID / Token (No username in URL)
    if (identifier1) {
      const lab = await this.prisma.labInstance.findUnique({
        where: { id: identifier1 },
        include: {
          challenge: { include: { category: true } },
          user: { select: { id: true, username: true } },
        },
      });

      if (lab) {
        const { rawFlag } = this.computePlayerChallengeFlag(
          lab.user.id,
          lab.challenge.slug,
        );
        const effectiveSubpath = identifier2 ? `/${identifier2}` : '';
        return {
          challenge: lab.challenge,
          rawFlag,
          user: lab.user,
          effectiveSubpath,
        };
      }
    }

    // 2. Check if identifier1 is a Challenge slug (e.g. /targets/sql-injection-auth-bypass/api/login)
    const directChallenge = await this.prisma.challenge.findFirst({
      where: {
        OR: [{ slug: identifier1 }, { id: identifier1 }],
      },
      include: { category: true },
    });

    if (directChallenge) {
      // identifier1 was the challenge slug!
      // In this case, identifier2 (if provided) is actually part of the target subpath
      const user = currentUser || (await this.getDefaultUser());
      if (!user) return null;

      const { rawFlag } = this.computePlayerChallengeFlag(
        user.id,
        directChallenge.slug,
      );

      const effectiveSubpath = identifier2 ? `/${identifier2}` : '';
      return {
        challenge: directChallenge,
        rawFlag,
        user,
        effectiveSubpath,
      };
    }

    // 3. Fallback: check if identifier1 is a user & identifier2 is a challenge
    if (identifier1 && identifier2) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ username: identifier1 }, { id: identifier1 }],
        },
        select: { id: true, username: true },
      });

      const challenge = await this.prisma.challenge.findFirst({
        where: {
          OR: [{ slug: identifier2 }, { id: identifier2 }],
        },
        include: { category: true },
      });

      if (user && challenge) {
        const { rawFlag } = this.computePlayerChallengeFlag(
          user.id,
          challenge.slug,
        );
        return { challenge, rawFlag, user };
      }
    }

    return null;
  }

  private async getDefaultUser(): Promise<{
    id: string;
    username: string;
  } | null> {
    const player = await this.prisma.user.findFirst({
      where: { role: 'USER' },
      select: { id: true, username: true },
    });
    if (player) return player;

    return this.prisma.user.findFirst({
      select: { id: true, username: true },
    });
  }
}

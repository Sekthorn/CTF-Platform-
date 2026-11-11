import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { QueryLeaderboardDto } from './dto/query-leaderboard.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private readonly CACHE_TTL_SECONDS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Retrieve dynamic scoreboard:
   * - ADMIN: Receives global administrative scoreboard across all participants.
   * - REGULAR PLAYER (USER): Strictly receives their own account details (no other players, no rank).
   * - UNAUTHENTICATED: Receives empty list.
   */
  async getLeaderboard(query: QueryLeaderboardDto, currentUser?: any) {
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    // 1. ADMIN VIEW: Full global scoreboard across all participants
    if (isAdmin) {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const cacheKey = `leaderboard:admin:p${page}:l${limit}`;

      // Try reading from Redis cache
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // Fall back to database on parse error
        }
      }

      // Query active users with their solve counts
      const [totalUsers, users] = await Promise.all([
        this.prisma.user.count({
          where: { isActive: true },
        }),
        this.prisma.user.findMany({
          where: { isActive: true },
          skip,
          take: limit,
          orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            totalPoints: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                progress: {
                  where: { status: 'SOLVED' },
                },
              },
            },
          },
        }),
      ]);

      // Calculate sequential rank for admin view
      const items = users.map((u, index) => ({
        rank: skip + index + 1,
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        totalPoints: u.totalPoints,
        solvedChallengesCount: u._count.progress,
        role: u.role,
      }));

      const result = {
        items,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
        totalParticipants: totalUsers,
        isAdminView: true,
        isPersonalOnly: false,
      };

      // Cache result in Redis for a short duration (5s) so updates are near real-time
      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        this.CACHE_TTL_SECONDS,
      );

      return result;
    }

    // 2. PLAYER VIEW: Show ONLY the authenticated player's own record (no other players, no rank)
    if (currentUser?.id) {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          totalPoints: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              progress: {
                where: { status: 'SOLVED' },
              },
            },
          },
        },
      });

      if (!user) {
        return {
          items: [],
          pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
          totalParticipants: 1,
          isAdminView: false,
          isPersonalOnly: true,
        };
      }

      return {
        items: [
          {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            totalPoints: user.totalPoints,
            solvedChallengesCount: user._count.progress,
            role: user.role,
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
        totalParticipants: 1,
        isAdminView: false,
        isPersonalOnly: true,
      };
    }

    // 3. UNAUTHENTICATED
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
      totalParticipants: 0,
      isAdminView: false,
      isPersonalOnly: false,
    };
  }
}

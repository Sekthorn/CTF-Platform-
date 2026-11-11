import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryChallengeDto } from './dto/query-challenge.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatus, Prisma, UserRole } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find paginated challenges with flexible filters
   * Automatically protects unpublished challenges from non-admin users
   */
  async findAll(query: QueryChallengeDto, currentUser?: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const isAdmin = currentUser?.role === UserRole.ADMIN;

    // Build Prisma where filter
    const where: Prisma.ChallengeWhereInput = {};

    // 1. Status Filter
    if (isAdmin && query.status) {
      where.status = query.status;
    } else {
      where.status = ChallengeStatus.PUBLISHED;
    }

    // 2. Category Filter
    if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug,
      };
    }

    // 3. Difficulty Filter
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    // 4. Search Filter (title or description)
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    // 5. Sorting
    const orderBy: Prisma.ChallengeOrderByWithRelationInput = {};
    const sortField = query.sortBy || 'points';
    const sortOrder = query.sortOrder || 'asc';
    orderBy[sortField] = sortOrder;

    // Execute queries in parallel
    const [totalCount, challenges] = await Promise.all([
      this.prisma.challenge.count({ where }),
      this.prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          points: true,
          status: true,
          description: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          references: {
            select: {
              reference: {
                select: {
                  name: true,
                  identifier: true,
                  referenceType: true,
                },
              },
            },
          },
          _count: {
            select: {
              submissions: {
                where: { isCorrect: true },
              },
              hints: true,
            },
          },
        },
      }),
    ]);

    // Check personal solve status if authenticated
    let solvedChallengeIds = new Set<string>();
    if (currentUser?.id) {
      const solved = await this.prisma.userChallengeProgress.findMany({
        where: {
          userId: currentUser.id,
          status: 'SOLVED',
          challengeId: { in: challenges.map((c) => c.id) },
        },
        select: { challengeId: true },
      });
      solvedChallengeIds = new Set(solved.map((s) => s.challengeId));
    }

    // Transform response (Never expose flagHash!)
    const formattedChallenges = challenges.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      difficulty: c.difficulty,
      points: c.points,
      status: c.status,
      description: c.description,
      category: c.category,
      references: c.references.map((r) => r.reference),
      solvedCount: c._count.submissions,
      hintsCount: c._count.hints,
      isSolved: solvedChallengeIds.has(c.id),
      createdAt: c.createdAt,
    }));

    return {
      items: formattedChallenges,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Find single challenge by slug with full learning content
   */
  async findBySlug(slug: string, currentUser?: any) {
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const challenge = await this.prisma.challenge.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        hints: {
          select: {
            id: true,
            title: true,
            costPoints: true,
            order: true,
            content: true,
          },
          orderBy: { order: 'asc' },
        },
        references: {
          select: {
            reference: true,
          },
        },
        _count: {
          select: {
            submissions: {
              where: { isCorrect: true },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with slug '${slug}' not found`);
    }

    // Restrict unpublished challenges to administrators
    if (challenge.status !== ChallengeStatus.PUBLISHED && !isAdmin) {
      throw new NotFoundException(`Challenge with slug '${slug}' not found`);
    }

    // Check user's personal solve status
    let userProgress: {
      status: string;
      solvedAt: Date | null;
      pointsEarned: number;
    } | null = null;
    if (currentUser?.id) {
      const progress = await this.prisma.userChallengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId: currentUser.id,
            challengeId: challenge.id,
          },
        },
        select: {
          status: true,
          solvedAt: true,
          pointsEarned: true,
        },
      });
      userProgress = progress;
    }

    return {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      difficulty: challenge.difficulty,
      points: challenge.points,
      status: challenge.status,
      description: challenge.description,
      instructions: challenge.instructions,
      objectives: challenge.objectives,
      category: challenge.category,
      hints: challenge.hints,
      references: challenge.references.map((r) => r.reference),
      solvedCount: challenge._count.submissions,
      userProgress,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }

  /**
   * Admin: Create a new challenge
   */
  async create(dto: CreateChallengeDto) {
    const baseSlug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug;

    // Check slug collision
    const existing = await this.prisma.challenge.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Hash the flag with SHA-256
    const flagHash = crypto
      .createHash('sha256')
      .update(dto.flag.trim())
      .digest('hex');

    return this.prisma.$transaction(async (tx) => {
      // 1. Create challenge
      const challenge = await tx.challenge.create({
        data: {
          title: dto.title,
          slug,
          description: dto.description,
          instructions: dto.instructions,
          difficulty: dto.difficulty,
          points: dto.points,
          categoryId: dto.categoryId,
          status: dto.status || ChallengeStatus.DRAFT,
          objectives: dto.objectives,
          flags: {
            create: {
              flagHash,
              flagPrefix: 'WEBSEC{',
              isCaseSensitive: true,
              isActive: true,
            },
          },
          hints: dto.hints
            ? {
                create: dto.hints.map((h, i) => ({
                  title: h.title,
                  content: h.content,
                  costPoints: h.costPoints || 0,
                  order: h.order || i + 1,
                })),
              }
            : undefined,
          references: dto.referenceIds
            ? {
                create: dto.referenceIds.map((refId) => ({
                  referenceId: refId,
                })),
              }
            : undefined,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          points: true,
          status: true,
          createdAt: true,
        },
      });

      return challenge;
    });
  }

  /**
   * Admin: Update existing challenge
   */
  async update(id: string, dto: UpdateChallengeDto) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID '${id}' not found`);
    }

    const updated = await this.prisma.challenge.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        difficulty: dto.difficulty,
        points: dto.points,
        categoryId: dto.categoryId,
        status: dto.status,
        objectives: dto.objectives,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        points: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Admin: Delete challenge
   */
  async delete(id: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID '${id}' not found`);
    }

    await this.prisma.challenge.delete({ where: { id } });
    return { message: `Challenge '${challenge.title}' successfully deleted` };
  }
}

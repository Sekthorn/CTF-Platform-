import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const [user, solvedCount] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatarUrl: true,
          totalPoints: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      }),
      this.prisma.userChallengeProgress.count({
        where: {
          userId,
          status: 'SOLVED',
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      ...user,
      solvedCount,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const dataToUpdate: { avatarUrl?: string; bio?: string } = {};

    if (dto.avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = dto.avatarUrl;
    }

    if (dto.bio !== undefined) {
      dataToUpdate.bio = dto.bio;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        totalPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

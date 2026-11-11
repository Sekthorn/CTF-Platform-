import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { UserRole } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  private async createAuditLog(
    action: string,
    userId?: string | null,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          userId: userId || null,
          details: details
            ? typeof details === 'string'
              ? details
              : JSON.stringify(details)
            : null,
          ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
          userAgent: userAgent ? userAgent.substring(0, 255) : null,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to record audit log: ${e.message}`);
    }
  }

  /**
   * List all administrators
   */
  async listAdmins() {
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        invitedBy: {
          select: { username: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create single-use administrator invitation
   */
  async createInvitation(
    currentAdminId: string,
    dto: InviteAdminDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const email = dto.email.toLowerCase().trim();

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        'An administrator with this email is already registered.',
      );
    }

    // Check if there is an active pending invite for this email
    const pendingInvite = await this.prisma.adminInvitation.findFirst({
      where: {
        email,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (pendingInvite) {
      throw new ConflictException(
        'An active invitation for this email address is already pending.',
      );
    }

    // Generate random 48-byte hex token
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    // 48-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const invitation = await this.prisma.adminInvitation.create({
      data: {
        email,
        tokenHash,
        invitedById: currentAdminId,
        expiresAt,
      },
    });

    await this.createAuditLog(
      'ADMIN_INVITATION_CREATED',
      currentAdminId,
      { invitedEmail: email, invitationId: invitation.id },
      ipAddress,
      userAgent,
    );

    return {
      id: invitation.id,
      email: invitation.email,
      token: rawToken,
      inviteLink: `/admin/accept-invitation?token=${rawToken}`,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }

  /**
   * List all invitations
   */
  async listInvitations() {
    return this.prisma.adminInvitation.findMany({
      select: {
        id: true,
        email: true,
        expiresAt: true,
        usedAt: true,
        revokedAt: true,
        createdAt: true,
        invitedBy: {
          select: { username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke pending administrator invitation
   */
  async revokeInvitation(
    currentAdminId: string,
    invitationId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const invite = await this.prisma.adminInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found.');
    }
    if (invite.usedAt) {
      throw new ConflictException(
        'Cannot revoke an invitation that has already been accepted.',
      );
    }

    const updated = await this.prisma.adminInvitation.update({
      where: { id: invitationId },
      data: { revokedAt: new Date() },
    });

    await this.createAuditLog(
      'ADMIN_INVITATION_REVOKED',
      currentAdminId,
      { invitationId, email: invite.email },
      ipAddress,
      userAgent,
    );

    return {
      message: 'Invitation revoked successfully.',
      invitation: updated,
    };
  }

  /**
   * Activate or suspend an administrator account
   */
  async updateStatus(
    currentAdminId: string,
    targetAdminId: string,
    dto: UpdateAdminStatusDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const targetAdmin = await this.prisma.user.findUnique({
      where: { id: targetAdminId },
    });

    if (!targetAdmin) {
      throw new NotFoundException('Administrator account not found.');
    }

    // Crucial Safeguard: Cannot deactivate the last active administrator
    if (!dto.isActive) {
      if (currentAdminId === targetAdminId) {
        throw new ForbiddenException(
          'You cannot suspend your own administrator account.',
        );
      }

      const activeAdminCount = await this.prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          'Cannot suspend the last active administrator.',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: targetAdminId },
      data: { isActive: dto.isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    // If suspended, revoke all active sessions immediately
    if (!dto.isActive) {
      await this.prisma.adminSession.updateMany({
        where: { userId: targetAdminId },
        data: { isRevoked: true },
      });
    }

    await this.createAuditLog(
      dto.isActive ? 'ADMIN_ACCOUNT_ACTIVATED' : 'ADMIN_ACCOUNT_SUSPENDED',
      currentAdminId,
      {
        targetAdminId,
        targetUsername: targetAdmin.username,
        newStatus: dto.isActive,
      },
      ipAddress,
      userAgent,
    );

    return updated;
  }

  /**
   * Paginated audit logs
   */
  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InitialSetupDto } from './dto/initial-setup.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';
import type { Response, Request } from 'express';

export interface AuthTokens {
  accessToken: string;
  sessionId: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper: Hash string with SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Helper: Record security event in AuditLog
   */
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
   * Check whether the platform requires initial admin setup
   */
  async getSetupStatus() {
    const adminCount = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    });
    return {
      isSetupRequired: adminCount === 0,
      adminCount,
    };
  }

  /**
   * Method A: Initial Administrator Setup
   * Only allowed when 0 administrators exist in the database and requires SETUP_SECRET
   */
  async initialSetup(
    dto: InitialSetupDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Verify setup secret against server configuration
    const expectedSecret = this.configService.get<string>('setupSecret');
    if (!expectedSecret || dto.setupSecret !== expectedSecret) {
      await this.createAuditLog(
        'INITIAL_SETUP_FAILED_BAD_SECRET',
        null,
        { attemptedUsername: dto.username },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        'Invalid setup secret. Check your server configuration.',
      );
    }

    // 2. Enforce only 1 initial setup: Must have 0 admins
    const existingAdminCount = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    });
    if (existingAdminCount > 0) {
      await this.createAuditLog(
        'INITIAL_SETUP_BLOCKED_ALREADY_EXISTS',
        null,
        { attemptedUsername: dto.username },
        ipAddress,
        userAgent,
      );
      throw new ForbiddenException(
        'Initial administrator setup has already been completed.',
      );
    }

    // 3. Check for conflict
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
      },
    });
    if (existingUser) {
      throw new ConflictException('Username or email is already registered.');
    }

    // 4. Hash password with bcrypt work factor 12
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 5. Create initial administrator with anime cyberpunk avatar
    const admin = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.ADMIN,
        avatarUrl: '/avatars/anime-cyber-male-01.jpg',
        isActive: true,
        totalPoints: 0,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    await this.createAuditLog(
      'INITIAL_ADMIN_SETUP_SUCCESS',
      admin.id,
      { username: admin.username, email: admin.email },
      ipAddress,
      userAgent,
    );
    this.logger.log(
      `Initial administrator ${admin.username} successfully provisioned.`,
    );

    return {
      success: true,
      message:
        'Initial administrator created successfully. You can now sign in.',
      admin,
    };
  }

  /**
   * Validate single-use invitation token
   */
  async validateInvitation(token: string) {
    const tokenHash = this.hashToken(token);
    const invite = await this.prisma.adminInvitation.findUnique({
      where: { tokenHash },
      include: {
        invitedBy: {
          select: { username: true, email: true },
        },
      },
    });

    if (!invite) {
      throw new BadRequestException('Invitation token is invalid.');
    }
    if (invite.usedAt) {
      throw new BadRequestException('This invitation has already been used.');
    }
    if (invite.revokedAt) {
      throw new BadRequestException(
        'This invitation has been revoked by an administrator.',
      );
    }
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('This invitation has expired.');
    }

    return {
      valid: true,
      email: invite.email,
      invitedBy: invite.invitedBy.username,
      expiresAt: invite.expiresAt,
    };
  }

  /**
   * Method B: Complete Administrator Invitation
   */
  async acceptInvitation(
    dto: AcceptInvitationDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = this.hashToken(dto.token);
    const invite = await this.prisma.adminInvitation.findUnique({
      where: { tokenHash },
    });

    if (
      !invite ||
      invite.usedAt ||
      invite.revokedAt ||
      invite.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Invitation is invalid, revoked, or expired.',
      );
    }

    // Check unique username or email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: invite.email.toLowerCase() }, { username: dto.username }],
      },
    });
    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException(
          'Username is already taken. Please choose another.',
        );
      }
      throw new ConflictException(
        'An administrator with this email is already registered.',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user and mark invite used in transaction
    const newAdmin = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: dto.username,
          email: invite.email.toLowerCase(),
          passwordHash,
          role: UserRole.ADMIN,
          isActive: true,
          invitedById: invite.invitedById,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      await tx.adminInvitation.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    await this.createAuditLog(
      'ADMIN_INVITATION_ACCEPTED',
      newAdmin.id,
      {
        username: newAdmin.username,
        email: newAdmin.email,
        invitationId: invite.id,
      },
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Administrator account created successfully. Please sign in.',
      user: newAdmin,
    };
  }

  /**
   * Standard Player Registration
   * Creates a normal USER role account.
   */
  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const username = dto.username.trim();
    const email = dto.email.trim().toLowerCase();

    // 1. Check if username or email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        throw new ConflictException(
          'Username is already taken. Please choose another.',
        );
      }
      throw new ConflictException(
        'An account with this email is already registered.',
      );
    }

    // 2. Hash password securely using bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Save new user in database with USER role & selected anime avatar
    const defaultAnimeAvatar = '/avatars/anime-matrix-hacker-01.jpg';
    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: UserRole.USER,
        avatarUrl: dto.avatarUrl?.trim() || defaultAnimeAvatar,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // 4. Log audit event
    await this.createAuditLog(
      'USER_REGISTRATION_SUCCESS',
      newUser.id,
      { username: newUser.username, email: newUser.email },
      ipAddress,
      userAgent,
    );

    this.logger.log(
      `New user registered successfully: ${newUser.username} (${newUser.email})`,
    );

    return {
      success: true,
      message: 'Account registered successfully. Please sign in.',
      user: newUser,
    };
  }

  /**
   * Standard and Admin User Login with Centralized Session
   */
  async login(
    dto: LoginDto,
    res?: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const identifier = dto.identifier.trim();

    // 1. Lookup user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });

    // Enforce generic errors to prevent account enumeration
    if (!user) {
      await this.createAuditLog(
        'LOGIN_FAILED_UNKNOWN_USER',
        null,
        { identifier },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Account suspension check
    if (!user.isActive) {
      await this.createAuditLog(
        'LOGIN_REJECTED_SUSPENDED',
        user.id,
        {},
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        'Account has been suspended. Contact an administrator.',
      );
    }

    // 2. Verify password
    const isPasswordValid = await this.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.createAuditLog(
        'LOGIN_FAILED_PASSWORD_MISMATCH',
        user.id,
        {},
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate JWT and Centralized AdminSession
    const tokens = await this.generateSession(
      user.id,
      user.username,
      user.email,
      user.role,
      userAgent,
      ipAddress,
    );

    // 4. Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.createAuditLog(
      'LOGIN_SUCCESS',
      user.id,
      { username: user.username },
      ipAddress,
      userAgent,
    );

    // 5. Set HttpOnly Cookie if Response object is provided
    if (res) {
      const isProduction =
        this.configService.get<string>('environment') === 'production';
      const cookieMaxAge = dto.rememberMe
        ? 30 * 24 * 60 * 60 * 1000 // 30 days for Remember Me
        : 7 * 24 * 60 * 60 * 1000; // 7 days default

      res.cookie('websec_session', tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: cookieMaxAge,
      });
      res.cookie('websec_session_id', tokens.sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: cookieMaxAge,
      });
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Centralized SSO Logout: Revokes session from MySQL and clears cookies
   */
  async logout(req: Request, res?: Response) {
    const sessionId =
      req.cookies?.['websec_session_id'] || req.headers['x-session-id'];
    const userId = (req as any).user?.id;

    if (sessionId && typeof sessionId === 'string') {
      const sessionHash = this.hashToken(sessionId);
      await this.prisma.adminSession.updateMany({
        where: { sessionHash },
        data: { isRevoked: true },
      });
    }

    if (res) {
      res.clearCookie('websec_session', { path: '/' });
      res.clearCookie('websec_session_id', { path: '/' });
    }

    if (userId) {
      await this.createAuditLog(
        'LOGOUT',
        userId,
        {},
        req.ip,
        req.headers['user-agent'],
      );
    }

    return {
      message: 'Logged out successfully from all administrative sessions.',
    };
  }

  /**
   * Password reset request workflow
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (user && user.role === UserRole.ADMIN && user.isActive) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(resetToken);
      // In production, send email; in development/audit logs, log securely
      await this.createAuditLog(
        'PASSWORD_RESET_REQUESTED',
        user.id,
        { tokenHash },
        ipAddress,
        userAgent,
      );
      this.logger.log(
        `Password reset token generated for ${user.email}: ${resetToken}`,
      );
    }

    // Always return generic response to prevent email disclosure
    return {
      message:
        'If an authorized administrator account exists for that email, password reset instructions have been logged.',
    };
  }

  /**
   * Complete password reset
   */
  async resetPassword(
    dto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = this.hashToken(dto.token);
    // Find audit log with this token created within 1 hour
    const recentLog = await this.prisma.auditLog.findFirst({
      where: {
        action: 'PASSWORD_RESET_REQUESTED',
        details: { contains: tokenHash },
        createdAt: { gte: new Date(Date.now() - 3600000) },
      },
    });

    if (!recentLog || !recentLog.userId) {
      throw new BadRequestException(
        'Password reset token is invalid or has expired.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: recentLog.userId },
      data: { passwordHash },
    });

    // Invalidate all active sessions for this admin
    await this.prisma.adminSession.updateMany({
      where: { userId: recentLog.userId },
      data: { isRevoked: true },
    });

    await this.createAuditLog(
      'PASSWORD_RESET_COMPLETED',
      recentLog.userId,
      {},
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message:
        'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Generate JWT + Centralized AdminSession
   */
  private async generateSession(
    userId: string,
    username: string,
    email: string,
    role: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, username, email, role };
    const expiresIn = this.configService.get<string>('jwt.expiresIn', '1d');
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: expiresIn as any,
    });

    // Generate cryptographically secure session ID
    const rawSessionId = crypto.randomBytes(40).toString('hex');
    const sessionHash = this.hashToken(rawSessionId);

    const sessionExpiryDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + sessionExpiryDays);

    await this.prisma.adminSession.create({
      data: {
        userId,
        sessionHash,
        expiresAt,
        userAgent: userAgent ? userAgent.substring(0, 255) : null,
        ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
        isRevoked: false,
      },
    });

    return {
      accessToken,
      sessionId: rawSessionId,
      expiresIn,
    };
  }

  /**
   * Password verification supporting both bcrypt and pbkdf2
   */
  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    if (hash.includes(':')) {
      const [salt, originalHash] = hash.split(':');
      const testHash = crypto
        .pbkdf2Sync(plain, salt, 100000, 64, 'sha512')
        .toString('hex');
      return crypto.timingSafeEqual(
        Buffer.from(testHash, 'hex'),
        Buffer.from(originalHash, 'hex'),
      );
    }

    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }
}

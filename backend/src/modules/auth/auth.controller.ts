import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InitialSetupDto } from './dto/initial-setup.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('setup-status')
  @ApiOperation({ summary: 'Check if initial administrator setup is required' })
  @ApiResponse({
    status: 200,
    description: 'Setup status returned successfully',
  })
  async getSetupStatus() {
    return this.authService.getSetupStatus();
  }

  @Post('initial-setup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Perform initial administrator setup (Only allowed when 0 admins exist)',
  })
  @ApiResponse({
    status: 201,
    description: 'Initial administrator successfully created',
  })
  @ApiResponse({ status: 401, description: 'Invalid setup secret' })
  @ApiResponse({ status: 403, description: 'Initial setup already completed' })
  async initialSetup(@Body() dto: InitialSetupDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.initialSetup(dto, ipAddress, userAgent);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Admin login (Sets HttpOnly SSO session cookie and returns access token)',
  })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account suspended',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, res, userAgent, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke active admin session and clear SSO cookies',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve authenticated administrator profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('invitations/:token')
  @ApiOperation({
    summary: 'Validate single-use administrator invitation token',
  })
  @ApiParam({ name: 'token', description: 'Raw invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation is valid' })
  @ApiResponse({
    status: 400,
    description: 'Invitation is invalid, revoked, or expired',
  })
  async validateInvitation(@Param('token') token: string) {
    return this.authService.validateInvitation(token);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Accept administrator invitation and create account',
  })
  @ApiResponse({
    status: 201,
    description: 'Administrator account created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.acceptInvitation(dto, ipAddress, userAgent);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset for administrator account' })
  @ApiResponse({
    status: 200,
    description: 'Password reset request acknowledged',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.forgotPassword(dto, ipAddress, userAgent);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset with verification token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.resetPassword(dto, ipAddress, userAgent);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Public registration for new CTF player accounts (Creates standard USER role)',
  })
  @ApiResponse({
    status: 201,
    description: 'Account registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid input',
  })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.register(dto, ipAddress, userAgent);
  }
}

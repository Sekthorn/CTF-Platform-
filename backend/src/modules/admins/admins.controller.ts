import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

@ApiTags('Admin Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered administrators' })
  @ApiResponse({ status: 200, description: 'List of administrators retrieved' })
  async listAdmins() {
    return this.adminsService.listAdmins();
  }

  @Post('invitations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a single-use administrator invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Email already registered or has pending invitation',
  })
  async createInvitation(
    @Body() dto: InviteAdminDto,
    @CurrentUser() admin: any,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.adminsService.createInvitation(
      admin.id,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Get('invitations')
  @ApiOperation({
    summary:
      'List all administrator invitations (pending, accepted, and revoked)',
  })
  @ApiResponse({ status: 200, description: 'List of invitations retrieved' })
  async listInvitations() {
    return this.adminsService.listInvitations();
  }

  @Delete('invitations/:id')
  @ApiOperation({ summary: 'Revoke a pending administrator invitation' })
  @ApiParam({ name: 'id', description: 'Invitation UUID' })
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async revokeInvitation(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.adminsService.revokeInvitation(
      admin.id,
      id,
      ipAddress,
      userAgent,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Suspend or activate an administrator account' })
  @ApiParam({ name: 'id', description: 'Target administrator UUID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Cannot deactivate yourself or the last active admin',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminStatusDto,
    @CurrentUser() admin: any,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.adminsService.updateStatus(
      admin.id,
      id,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View system and security audit logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Paginated audit logs retrieved' })
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.adminsService.getAuditLogs(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 50,
    );
  }
}

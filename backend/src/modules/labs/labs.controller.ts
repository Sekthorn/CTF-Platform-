import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LabsService } from './labs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Player Lab Instances')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post(':challengeId/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Launch or resume an isolated target lab instance' })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID' })
  @ApiResponse({
    status: 200,
    description: 'Lab instance ready with target URL',
  })
  async startLab(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.labsService.startLab(user.id, challengeId);
  }

  @Post(':challengeId/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop and terminate an active lab instance' })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Lab stopped successfully' })
  async stopLab(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.labsService.stopLab(user.id, challengeId);
  }

  @Post(':challengeId/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset lab instance with a fresh environment and new unique flag',
  })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Lab instance reset successfully' })
  async resetLab(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.labsService.resetLab(user.id, challengeId);
  }

  @Get(':challengeId/status')
  @ApiOperation({ summary: 'Get current lab status and countdown timer' })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Current lab status details' })
  async getStatus(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.labsService.getStatus(user.id, challengeId);
  }

  @Get(':challengeId/target')
  @ApiOperation({
    summary: 'Get direct integrated target URL and status for challenge',
  })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID or slug' })
  @ApiResponse({ status: 200, description: 'Target details with active URL' })
  async getTarget(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.labsService.getOrCreatePlayerTarget(user.id, challengeId);
  }
}

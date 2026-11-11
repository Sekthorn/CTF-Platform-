import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
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
import { Throttle } from '@nestjs/throttler';
import { ChallengesService } from './challenges.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { QueryChallengeDto } from './dto/query-challenge.dto';
import { SubmitFlagDto } from '../submissions/dto/submit-flag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'List published challenges with filtering, pagination, and solve status',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of challenges retrieved successfully',
  })
  async findAll(
    @Query() query: QueryChallengeDto,
    @CurrentUser() currentUser?: any,
  ) {
    return this.challengesService.findAll(query, currentUser);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get challenge details, hints, learning references, and current user progress',
  })
  @ApiParam({ name: 'slug', example: 'sql-injection-auth-bypass' })
  @ApiResponse({
    status: 200,
    description: 'Challenge details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() currentUser?: any,
  ) {
    return this.challengesService.findBySlug(slug, currentUser);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Submit a captured flag for verification and award points (Max 5 attempts/min)',
  })
  @ApiParam({ name: 'id', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Flag evaluated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid flag submission or challenge not active',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 429,
    description: 'Too many flag submission attempts (Rate limit exceeded)',
  })
  async submitFlag(
    @Param('id') challengeId: string,
    @Body() dto: SubmitFlagDto,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.submitFlag(challengeId, user.id, dto);
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user submission history for a specific challenge',
  })
  @ApiParam({ name: 'id', description: 'Challenge UUID' })
  @ApiResponse({
    status: 200,
    description: 'Recent submission attempts for this challenge',
  })
  async getChallengeSubmissions(
    @Param('id') challengeId: string,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.getChallengeSubmissions(
      user.id,
      challengeId,
    );
  }
}

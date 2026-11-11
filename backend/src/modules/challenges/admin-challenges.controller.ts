import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { QueryChallengeDto } from './dto/query-challenge.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Challenges')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/challenges')
export class AdminChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin: List all challenges including draft and archived status',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenges retrieved successfully',
  })
  async findAllAdmin(
    @Query() query: QueryChallengeDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.challengesService.findAll(query, adminUser);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Admin: Create a new challenge with secure hashed flag and hints',
  })
  @ApiResponse({ status: 201, description: 'Challenge created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid challenge data' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  async create(@Body() dto: CreateChallengeDto) {
    return this.challengesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Admin: Update challenge metadata, difficulty, or content',
  })
  @ApiParam({ name: 'id', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Challenge updated successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.challengesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete challenge' })
  @ApiParam({ name: 'id', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Challenge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async delete(@Param('id') id: string) {
    return this.challengesService.delete(id);
  }
}

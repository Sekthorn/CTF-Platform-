import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { KnowledgeService } from './knowledge.service';
import { QueryLessonsDto } from './dto/query-lessons.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Security Knowledge Lessons')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('lessons')
  @ApiOperation({
    summary: 'List security knowledge lessons with lock/complete status',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of lessons' })
  async getLessons(@CurrentUser() user: any, @Query() query: QueryLessonsDto) {
    return this.knowledgeService.getLessons(user.id, user.role, query);
  }

  @Get('progress')
  @ApiOperation({
    summary: 'Get current user learning analytics and category progress',
  })
  @ApiResponse({ status: 200, description: 'User learning progress summary' })
  async getProgress(@CurrentUser() user: any) {
    return this.knowledgeService.getUserProgress(user.id, user.role);
  }

  @Get('lessons/:slug')
  @ApiOperation({ summary: 'Get single lesson details with solution gating' })
  @ApiParam({ name: 'slug', description: 'Unique slug of the lesson' })
  @ApiResponse({ status: 200, description: 'Lesson details' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLessonBySlug(@CurrentUser() user: any, @Param('slug') slug: string) {
    return this.knowledgeService.getLessonBySlug(user.id, user.role, slug);
  }

  @Post('lessons/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson' })
  @ApiResponse({ status: 200, description: 'Lesson marked as completed' })
  async completeLesson(@CurrentUser() user: any, @Param('id') id: string) {
    return this.knowledgeService.completeLesson(user.id, id);
  }

  // -------------------------------------------------------------------------
  // Admin Lesson Management
  // -------------------------------------------------------------------------

  @Post('admin/lessons')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Create a new knowledge lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  async createLesson(@Body() dto: CreateLessonDto) {
    return this.knowledgeService.createLesson(dto);
  }

  @Patch('admin/lessons/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Update an existing knowledge lesson' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson to update' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.knowledgeService.updateLesson(id, dto);
  }

  @Delete('admin/lessons/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Delete a knowledge lesson' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson to delete' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(@Param('id') id: string) {
    return this.knowledgeService.deleteLesson(id);
  }
}

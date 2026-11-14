import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma ORM connected to MySQL database');

      // Self-healing database check: ensure lab_instances and instance_flags tables exist
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`lab_instances\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`userId\` VARCHAR(191) NOT NULL,
          \`challengeId\` VARCHAR(191) NOT NULL,
          \`targetUrl\` VARCHAR(255) NOT NULL,
          \`status\` ENUM('NOT_STARTED', 'STARTING', 'RUNNING', 'STOPPED', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'NOT_STARTED',
          \`port\` INTEGER NULL,
          \`expiresAt\` DATETIME(3) NOT NULL,
          \`startedAt\` DATETIME(3) NULL,
          \`stoppedAt\` DATETIME(3) NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          UNIQUE INDEX \`lab_instances_userId_challengeId_key\`(\`userId\`, \`challengeId\`),
          INDEX \`lab_instances_userId_idx\`(\`userId\`),
          INDEX \`lab_instances_challengeId_idx\`(\`challengeId\`),
          INDEX \`lab_instances_status_idx\`(\`status\`),
          INDEX \`lab_instances_expiresAt_idx\`(\`expiresAt\`),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `).catch((err: any) => {
        this.logger.debug(`lab_instances table check notice: ${err.message}`);
      });

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`instance_flags\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`instanceId\` VARCHAR(191) NOT NULL,
          \`flagHash\` VARCHAR(255) NOT NULL,
          \`flagPrefix\` VARCHAR(20) NOT NULL DEFAULT 'WEBSEC{',
          \`isUsed\` BOOLEAN NOT NULL DEFAULT false,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          UNIQUE INDEX \`instance_flags_instanceId_key\`(\`instanceId\`),
          INDEX \`instance_flags_instanceId_idx\`(\`instanceId\`),
          INDEX \`instance_flags_isUsed_idx\`(\`isUsed\`),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `).catch((err: any) => {
        this.logger.debug(`instance_flags table check notice: ${err.message}`);
      });

      // Self-healing database check: ensure submissions.instanceId column exists
      try {
        const columns: any[] = await this.$queryRawUnsafe(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'submissions' AND COLUMN_NAME = 'instanceId'
        `);

        if (Array.isArray(columns) && columns.length === 0) {
          await this.$executeRawUnsafe(`
            ALTER TABLE \`submissions\` ADD COLUMN \`instanceId\` VARCHAR(191) NULL;
          `);
          await this.$executeRawUnsafe(`
            CREATE INDEX \`submissions_instanceId_idx\` ON \`submissions\`(\`instanceId\`);
          `).catch(() => {});
          this.logger.log('Self-healed: added missing `instanceId` column to `submissions` table');
        }
      } catch (colErr: any) {
        this.logger.debug(`submissions.instanceId column check notice: ${colErr.message}`);
      }

      // Self-healing database check: ensure high-performance composite indexes exist
      try {
        const existingIndexes = (await this.$queryRawUnsafe(`
          SELECT DISTINCT INDEX_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME IN (
            'submissions_challengeId_isCorrect_idx',
            'submissions_userId_isCorrect_idx',
            'user_challenge_progress_userId_status_idx',
            'user_challenge_progress_challengeId_status_idx',
            'user_lesson_progress_userId_status_idx'
          )
        `).catch(() => [])) as any[];

        const indexSet = new Set(
          Array.isArray(existingIndexes)
            ? existingIndexes.map((i: any) => `${i.TABLE_NAME}.${i.INDEX_NAME}`)
            : []
        );

        if (!indexSet.has('submissions.submissions_challengeId_isCorrect_idx')) {
          await this.$executeRawUnsafe(
            'CREATE INDEX `submissions_challengeId_isCorrect_idx` ON `submissions`(`challengeId`, `isCorrect`)'
          ).catch(() => {});
        }
        if (!indexSet.has('submissions.submissions_userId_isCorrect_idx')) {
          await this.$executeRawUnsafe(
            'CREATE INDEX `submissions_userId_isCorrect_idx` ON `submissions`(`userId`, `isCorrect`)'
          ).catch(() => {});
        }
        if (!indexSet.has('user_challenge_progress.user_challenge_progress_userId_status_idx')) {
          await this.$executeRawUnsafe(
            'CREATE INDEX `user_challenge_progress_userId_status_idx` ON `user_challenge_progress`(`userId`, `status`)'
          ).catch(() => {});
        }
        if (!indexSet.has('user_challenge_progress.user_challenge_progress_challengeId_status_idx')) {
          await this.$executeRawUnsafe(
            'CREATE INDEX `user_challenge_progress_challengeId_status_idx` ON `user_challenge_progress`(`challengeId`, `status`)'
          ).catch(() => {});
        }
        if (!indexSet.has('user_lesson_progress.user_lesson_progress_userId_status_idx')) {
          await this.$executeRawUnsafe(
            'CREATE INDEX `user_lesson_progress_userId_status_idx` ON `user_lesson_progress`(`userId`, `status`)'
          ).catch(() => {});
        }
      } catch (idxErr: any) {
        this.logger.debug(`Performance index check notice: ${idxErr.message}`);
      }
    } catch (error) {
      this.logger.warn(
        `Prisma initial connection deferred: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma ORM disconnected from MySQL database');
  }
}

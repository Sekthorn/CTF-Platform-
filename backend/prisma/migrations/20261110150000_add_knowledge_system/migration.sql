-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `knowledge_lessons` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `difficulty` ENUM('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT') NOT NULL DEFAULT 'BEGINNER',
    `owaspReference` VARCHAR(100) NULL,
    `cweReference` VARCHAR(100) NULL,
    `cvssScore` DOUBLE NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    `overview` TEXT NOT NULL,
    `rootCause` TEXT NOT NULL,
    `mechanics` TEXT NOT NULL,
    `attackScenario` TEXT NOT NULL,
    `securityImpact` TEXT NOT NULL,
    `prevention` TEXT NOT NULL,
    `vulnerableCode` TEXT NOT NULL,
    `secureCode` TEXT NOT NULL,
    `codeLanguage` VARCHAR(50) NOT NULL DEFAULT 'javascript',
    `realWorldExample` TEXT NOT NULL,
    `referencesJson` TEXT NOT NULL,
    `keyTakeaways` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `knowledge_lessons_challengeId_key`(`challengeId`),
    UNIQUE INDEX `knowledge_lessons_slug_key`(`slug`),
    INDEX `knowledge_lessons_category_idx`(`category`),
    INDEX `knowledge_lessons_difficulty_idx`(`difficulty`),
    INDEX `knowledge_lessons_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_lesson_progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'SOLVED') NOT NULL DEFAULT 'IN_PROGRESS',
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_lesson_progress_userId_idx`(`userId`),
    INDEX `user_lesson_progress_lessonId_idx`(`lessonId`),
    INDEX `user_lesson_progress_status_idx`(`status`),
    UNIQUE INDEX `user_lesson_progress_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `knowledge_lessons` ADD CONSTRAINT `knowledge_lessons_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_lesson_progress` ADD CONSTRAINT `user_lesson_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_lesson_progress` ADD CONSTRAINT `user_lesson_progress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `knowledge_lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

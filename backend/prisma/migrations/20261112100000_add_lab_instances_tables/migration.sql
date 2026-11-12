-- CreateTable
CREATE TABLE IF NOT EXISTS `lab_instances` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `targetUrl` VARCHAR(255) NOT NULL,
    `status` ENUM('NOT_STARTED', 'STARTING', 'RUNNING', 'STOPPED', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'NOT_STARTED',
    `port` INTEGER NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `startedAt` DATETIME(3) NULL,
    `stoppedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_instances_userId_challengeId_key`(`userId`, `challengeId`),
    INDEX `lab_instances_userId_idx`(`userId`),
    INDEX `lab_instances_challengeId_idx`(`challengeId`),
    INDEX `lab_instances_status_idx`(`status`),
    INDEX `lab_instances_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `instance_flags` (
    `id` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `flagHash` VARCHAR(255) NOT NULL,
    `flagPrefix` VARCHAR(20) NOT NULL DEFAULT 'WEBSEC{',
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instance_flags_instanceId_key`(`instanceId`),
    INDEX `instance_flags_instanceId_idx`(`instanceId`),
    INDEX `instance_flags_isUsed_idx`(`isUsed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lab_instances` ADD CONSTRAINT `lab_instances_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_instances` ADD CONSTRAINT `lab_instances_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instance_flags` ADD CONSTRAINT `instance_flags_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `lab_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

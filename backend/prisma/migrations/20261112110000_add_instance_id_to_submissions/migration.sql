-- AlterTable
ALTER TABLE `submissions` ADD COLUMN `instanceId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `submissions_instanceId_idx` ON `submissions`(`instanceId`);

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `lab_instances`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

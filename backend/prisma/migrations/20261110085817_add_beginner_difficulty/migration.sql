-- AlterTable
ALTER TABLE `challenges` MODIFY `difficulty` ENUM('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT') NOT NULL DEFAULT 'EASY';

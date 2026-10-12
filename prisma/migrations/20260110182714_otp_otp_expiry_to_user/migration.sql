-- AlterTable
ALTER TABLE `users` ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otp_expiry` VARCHAR(191) NULL;

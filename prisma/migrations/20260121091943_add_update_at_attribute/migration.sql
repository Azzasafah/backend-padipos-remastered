-- AlterTable
ALTER TABLE `categories` ADD COLUMN `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `updated_at` DATETIME(3) NULL;

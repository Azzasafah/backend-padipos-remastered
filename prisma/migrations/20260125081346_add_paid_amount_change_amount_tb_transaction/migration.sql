-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `change_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `paid_amount` DECIMAL(10, 2) NULL;

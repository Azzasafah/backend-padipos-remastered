/*
  Warnings:

  - You are about to alter the column `table_number` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.

*/
-- AlterTable
ALTER TABLE `transactions` MODIFY `table_number` INTEGER NULL;

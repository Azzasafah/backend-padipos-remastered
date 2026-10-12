-- AlterTable
ALTER TABLE `transactions` MODIFY `midtrans_order_id` VARCHAR(255) NULL,
    MODIFY `midtrans_snap_token` TEXT NULL,
    MODIFY `paid_at` DATETIME(3) NULL;

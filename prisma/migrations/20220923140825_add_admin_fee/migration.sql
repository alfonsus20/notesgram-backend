/*
  Warnings:

  - Added the required column `admin_fee` to the `topup_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin_fee` to the `withdrawal_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "topup_transactions" ADD COLUMN     "admin_fee" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "withdrawal_transactions" ADD COLUMN     "admin_fee" INTEGER NOT NULL;

/*
  Warnings:

  - Added the required column `status` to the `topup_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "topup_transactions" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "payment_method" DROP NOT NULL;

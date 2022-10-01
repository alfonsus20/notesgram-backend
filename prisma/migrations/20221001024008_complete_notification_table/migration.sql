/*
  Warnings:

  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationCategory" ADD VALUE 'FOLLOW';
ALTER TYPE "NotificationCategory" ADD VALUE 'TOPUP';
ALTER TYPE "NotificationCategory" ADD VALUE 'WITHDRAWAL';

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "userId",
ADD COLUMN     "creatorId" INTEGER,
ADD COLUMN     "noteId" INTEGER,
ADD COLUMN     "postId" INTEGER,
ADD COLUMN     "receiverId" INTEGER,
ADD COLUMN     "topupId" TEXT,
ADD COLUMN     "withdrawalId" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_topupId_fkey" FOREIGN KEY ("topupId") REFERENCES "topup_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "withdrawal_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationCategory" ADD VALUE 'COMMENT';
ALTER TYPE "NotificationCategory" ADD VALUE 'LIKE';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "promoId" INTEGER;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

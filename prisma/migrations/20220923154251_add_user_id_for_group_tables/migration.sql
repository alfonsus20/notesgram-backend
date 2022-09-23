/*
  Warnings:

  - Added the required column `userId` to the `note_bookmarked_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `note_purchased_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "note_bookmarked_groups" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "note_purchased_groups" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "note_bookmarked_groups" ADD CONSTRAINT "note_bookmarked_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_purchased_groups" ADD CONSTRAINT "note_purchased_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

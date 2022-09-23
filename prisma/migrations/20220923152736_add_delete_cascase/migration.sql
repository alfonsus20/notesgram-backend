/*
  Warnings:

  - Added the required column `groupId` to the `note_bookmarked_group_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `note_purchased_group_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "note_bookmarked_group_members" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "note_purchased_group_members" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "note_bookmarked_group_members" ADD CONSTRAINT "note_bookmarked_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "note_bookmarked_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_purchased_group_members" ADD CONSTRAINT "note_purchased_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "note_purchased_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

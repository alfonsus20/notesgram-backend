/*
  Warnings:

  - You are about to drop the column `postId` on the `note_bookmarked_group_members` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `note_purchased_group_members` table. All the data in the column will be lost.
  - Added the required column `noteId` to the `note_bookmarked_group_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noteId` to the `note_purchased_group_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "note_bookmarked_group_members" DROP CONSTRAINT "note_bookmarked_group_members_postId_fkey";

-- DropForeignKey
ALTER TABLE "note_purchased_group_members" DROP CONSTRAINT "note_purchased_group_members_postId_fkey";

-- AlterTable
ALTER TABLE "note_bookmarked_group_members" DROP COLUMN "postId",
ADD COLUMN     "noteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "note_purchased_group_members" DROP COLUMN "postId",
ADD COLUMN     "noteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "note_bookmarked_group_members" ADD CONSTRAINT "note_bookmarked_group_members_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_purchased_group_members" ADD CONSTRAINT "note_purchased_group_members_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

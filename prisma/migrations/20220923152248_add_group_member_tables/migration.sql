/*
  Warnings:

  - You are about to drop the column `postId` on the `note_bookmarked_groups` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `note_purchased_groups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "note_bookmarked_groups" DROP CONSTRAINT "note_bookmarked_groups_postId_fkey";

-- DropForeignKey
ALTER TABLE "note_purchased_groups" DROP CONSTRAINT "note_purchased_groups_postId_fkey";

-- AlterTable
ALTER TABLE "note_bookmarked_groups" DROP COLUMN "postId";

-- AlterTable
ALTER TABLE "note_purchased_groups" DROP COLUMN "postId";

-- CreateTable
CREATE TABLE "note_bookmarked_group_members" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "note_bookmarked_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_purchased_group_members" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "note_purchased_group_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "note_bookmarked_group_members" ADD CONSTRAINT "note_bookmarked_group_members_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_purchased_group_members" ADD CONSTRAINT "note_purchased_group_members_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

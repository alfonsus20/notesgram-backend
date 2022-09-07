/*
  Warnings:

  - Added the required column `comment` to the `post_comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_userId_fkey";

-- AlterTable
ALTER TABLE "post_comments" ADD COLUMN     "comment" TEXT NOT NULL;

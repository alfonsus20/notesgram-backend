/*
  Warnings:

  - You are about to drop the column `postId` on the `notes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[noteId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `noteId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_postId_fkey";

-- DropIndex
DROP INDEX "notes_postId_key";

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "postId";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "noteId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "posts_noteId_key" ON "posts"("noteId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

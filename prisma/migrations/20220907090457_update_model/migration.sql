/*
  Warnings:

  - You are about to drop the column `noteId` on the `posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId]` on the table `notes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_noteId_fkey";

-- DropIndex
DROP INDEX "posts_noteId_key";

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "postId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "noteId";

-- CreateIndex
CREATE UNIQUE INDEX "notes_postId_key" ON "notes"("postId");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

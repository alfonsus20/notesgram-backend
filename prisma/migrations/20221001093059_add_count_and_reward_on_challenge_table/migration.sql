/*
  Warnings:

  - Added the required column `count` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reward` to the `challenges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "reward" INTEGER NOT NULL;

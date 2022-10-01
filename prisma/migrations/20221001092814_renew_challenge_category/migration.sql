/*
  Warnings:

  - The values [COMMENT,LIKE] on the enum `ChallengeCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChallengeCategory_new" AS ENUM ('COMMENT_GIVEN', 'LIKE_GIVEN', 'COMMENT_GAINED', 'LIKE_GAINED', 'NOTE_SALE', 'NOTE_PURCHASE');
ALTER TABLE "challenges" ALTER COLUMN "category" TYPE "ChallengeCategory_new" USING ("category"::text::"ChallengeCategory_new");
ALTER TYPE "ChallengeCategory" RENAME TO "ChallengeCategory_old";
ALTER TYPE "ChallengeCategory_new" RENAME TO "ChallengeCategory";
DROP TYPE "ChallengeCategory_old";
COMMIT;

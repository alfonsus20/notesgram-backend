-- CreateEnum
CREATE TYPE "ChallengePeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('COMMENT', 'LIKE', 'NOTE_SALE');

-- CreateTable
CREATE TABLE "challenges" (
    "id" SERIAL NOT NULL,
    "period" "ChallengePeriod" NOT NULL,
    "category" "ChallengeCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_claim" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_claim_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "challenge_claim" ADD CONSTRAINT "challenge_claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_claim" ADD CONSTRAINT "challenge_claim_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

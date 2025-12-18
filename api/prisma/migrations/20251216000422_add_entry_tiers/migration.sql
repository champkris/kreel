-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('STORY_CO_CREATION', 'CHARACTER_DEVELOPMENT', 'ALTERNATE_ENDING', 'WORLDBUILDING', 'THEME_MICRO');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'VOTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntryTier" AS ENUM ('FREE', 'COIN_ENTRY', 'EXCLUSIVE', 'CREATOR_TOKEN');

-- CreateEnum
CREATE TYPE "ExclusiveType" AS ENUM ('CLUB_MEMBER', 'PREMIUM_USER', 'BOTH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_REWARD';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_ENTRY_FEE';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_PRIZE_PAYOUT';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_REFUND';

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "guidelines" TEXT,
    "thumbnail" TEXT,
    "attachments" JSONB,
    "maxEntries" INTEGER,
    "wordLimit" INTEGER,
    "entryTier" "EntryTier" NOT NULL DEFAULT 'FREE',
    "entryFee" DECIMAL(10,2),
    "prizePool" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "platformCommission" DECIMAL(5,4) NOT NULL DEFAULT 0.30,
    "exclusiveType" "ExclusiveType",
    "requiredTokenId" TEXT,
    "rewardAmount" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "maxWinners" INTEGER NOT NULL DEFAULT 1,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionStart" TIMESTAMP(3),
    "submissionEnd" TIMESTAMP(3) NOT NULL,
    "votingEnd" TIMESTAMP(3),
    "entryCount" INTEGER NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_entries" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "winnerRank" INTEGER,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "entryFeePaid" DECIMAL(10,2),
    "feeTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_votes" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_tokens" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "totalSupply" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_holders" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_holders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenges_clubId_status_idx" ON "challenges"("clubId", "status");

-- CreateIndex
CREATE INDEX "challenges_status_submissionEnd_idx" ON "challenges"("status", "submissionEnd");

-- CreateIndex
CREATE INDEX "challenges_entryTier_idx" ON "challenges"("entryTier");

-- CreateIndex
CREATE INDEX "challenge_entries_challengeId_voteCount_idx" ON "challenge_entries"("challengeId", "voteCount");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_entries_challengeId_userId_key" ON "challenge_entries"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_votes_entryId_voterId_key" ON "challenge_votes"("entryId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "creator_tokens_creatorId_key" ON "creator_tokens"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "token_holders_tokenId_userId_key" ON "token_holders"("tokenId", "userId");

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_requiredTokenId_fkey" FOREIGN KEY ("requiredTokenId") REFERENCES "creator_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_entries" ADD CONSTRAINT "challenge_entries_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_entries" ADD CONSTRAINT "challenge_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_votes" ADD CONSTRAINT "challenge_votes_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "challenge_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_votes" ADD CONSTRAINT "challenge_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_tokens" ADD CONSTRAINT "creator_tokens_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_holders" ADD CONSTRAINT "token_holders_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "creator_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_holders" ADD CONSTRAINT "token_holders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

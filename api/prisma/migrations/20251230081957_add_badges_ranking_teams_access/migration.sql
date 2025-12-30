-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('OFFICIAL', 'VERIFIED_CREATOR', 'TOP_CONTRIBUTOR', 'RISING_STAR', 'CHALLENGE_WINNER', 'CLUB_FOUNDER');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'UPLOADER', 'VIEWER');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "TeamInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VideoAccessType" AS ENUM ('FREE', 'LOCKED', 'PAID');

-- CreateEnum
CREATE TYPE "ClubVerificationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "officialVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationStatus" "ClubVerificationStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "series" ADD COLUMN     "freeEpisodeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "currentRankId" TEXT,
ADD COLUMN     "experiencePoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isSubAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentAccountId" TEXT;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "accessType" "VideoAccessType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "previewDuration" INTEGER;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "rewardsBalance" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "criteria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "rank_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "parentUserId" TEXT NOT NULL,
    "memberUserId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'VIEWER',
    "permissions" JSONB,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_invitations" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "receiverId" TEXT,
    "role" "TeamRole" NOT NULL DEFAULT 'VIEWER',
    "permissions" JSONB,
    "status" "TeamInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "rank_tiers_name_key" ON "rank_tiers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_parentUserId_memberUserId_key" ON "team_members"("parentUserId", "memberUserId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentRankId_fkey" FOREIGN KEY ("currentRankId") REFERENCES "rank_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_memberUserId_fkey" FOREIGN KEY ("memberUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

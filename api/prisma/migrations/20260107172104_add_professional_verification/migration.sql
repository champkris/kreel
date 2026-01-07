-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'IDENTITY_SUBMITTED', 'ADDRESS_SUBMITTED', 'PAYMENT_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "professional_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "idType" TEXT,
    "idDocumentUrl" TEXT,
    "idVerifiedAt" TIMESTAMP(3),
    "addressDocType" TEXT,
    "addressDocUrl" TEXT,
    "addressVerifiedAt" TIMESTAMP(3),
    "payoutMethod" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "paypalEmail" TEXT,
    "stripeEmail" TEXT,
    "paymentVerifiedAt" TIMESTAMP(3),
    "businessName" TEXT,
    "businessRegNumber" TEXT,
    "taxId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_verifications_userId_key" ON "professional_verifications"("userId");

-- AddForeignKey
ALTER TABLE "professional_verifications" ADD CONSTRAINT "professional_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

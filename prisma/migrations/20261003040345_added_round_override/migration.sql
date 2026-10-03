-- CreateTable
CREATE TABLE "RoundOverride" (
    "id" TEXT NOT NULL,
    "roundDuration" INTEGER NOT NULL,
    "overrideType" TEXT NOT NULL,
    "overrideValue" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundOverride_roundDuration_key" ON "RoundOverride"("roundDuration");

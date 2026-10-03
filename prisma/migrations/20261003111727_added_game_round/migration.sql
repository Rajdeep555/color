-- CreateTable
CREATE TABLE "GameRound" (
    "id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRound_duration_period_key" ON "GameRound"("duration", "period");

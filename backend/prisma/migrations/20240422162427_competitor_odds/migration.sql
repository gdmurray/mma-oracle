/*
  Warnings:

  - A unique constraint covering the columns `[competitorOneOddsId]` on the table `Competition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[competitorTwoOddsId]` on the table `Competition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OddsSource" AS ENUM ('MODEL', 'REAL', 'TAPOLOGY');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "competitorOneOddsId" TEXT,
ADD COLUMN     "competitorTwoOddsId" TEXT;

-- CreateTable
CREATE TABLE "CompetitorOdds" (
    "id" TEXT NOT NULL,
    "moneyLine" DOUBLE PRECISION,
    "decision" DOUBLE PRECISION,
    "tko" DOUBLE PRECISION,
    "submission" DOUBLE PRECISION,
    "source" "OddsSource" NOT NULL DEFAULT 'MODEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorOdds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competition_competitorOneOddsId_key" ON "Competition"("competitorOneOddsId");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_competitorTwoOddsId_key" ON "Competition"("competitorTwoOddsId");

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_competitorOneOddsId_fkey" FOREIGN KEY ("competitorOneOddsId") REFERENCES "CompetitorOdds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_competitorTwoOddsId_fkey" FOREIGN KEY ("competitorTwoOddsId") REFERENCES "CompetitorOdds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

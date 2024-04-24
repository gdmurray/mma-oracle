/*
  Warnings:

  - You are about to drop the column `competitorOneOddsId` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competitorTwoOddsId` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `athleteId` to the `CompetitorOdds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `CompetitorOdds` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Competition" DROP CONSTRAINT "Competition_competitorOneOddsId_fkey";

-- DropForeignKey
ALTER TABLE "Competition" DROP CONSTRAINT "Competition_competitorTwoOddsId_fkey";

-- DropIndex
DROP INDEX "Competition_competitorOneOddsId_key";

-- DropIndex
DROP INDEX "Competition_competitorTwoOddsId_key";

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "competitorOneOddsId",
DROP COLUMN "competitorTwoOddsId";

-- AlterTable
ALTER TABLE "CompetitorOdds" ADD COLUMN     "athleteId" TEXT NOT NULL,
ADD COLUMN     "competitionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CompetitorOdds" ADD CONSTRAINT "CompetitorOdds_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorOdds" ADD CONSTRAINT "CompetitorOdds_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `leagueId` on the `Promotion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_leagueId_fkey";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "leagueId",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'ufc';

-- CreateTable
CREATE TABLE "_LeagueToPromotion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LeagueToPromotion_AB_unique" ON "_LeagueToPromotion"("A", "B");

-- CreateIndex
CREATE INDEX "_LeagueToPromotion_B_index" ON "_LeagueToPromotion"("B");

-- AddForeignKey
ALTER TABLE "_LeagueToPromotion" ADD CONSTRAINT "_LeagueToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueToPromotion" ADD CONSTRAINT "_LeagueToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

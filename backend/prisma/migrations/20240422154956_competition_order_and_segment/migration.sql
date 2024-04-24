/*
  Warnings:

  - Added the required column `eventId` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CardSegment" AS ENUM ('MAIN', 'PRELIM', 'EARLY_PRELIM');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "segment" "CardSegment" NOT NULL DEFAULT 'MAIN';

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

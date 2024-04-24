/*
  Warnings:

  - A unique constraint covering the columns `[internalId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_internalId_key" ON "Event"("internalId");

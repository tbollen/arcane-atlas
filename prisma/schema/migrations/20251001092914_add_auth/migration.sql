/*
  Warnings:

  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Card";

-- CreateTable
CREATE TABLE "public"."card" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userIds" TEXT[],
    "campaignIds" TEXT[],
    "characterIds" TEXT[],
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" JSONB NOT NULL,
    "stylePreset" TEXT NOT NULL,
    "style" JSONB NOT NULL,
    "systems" TEXT[],
    "mechanics" JSONB NOT NULL,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_id_key" ON "public"."card"("id");

/*
  Warnings:

  - You are about to drop the column `campaignIds` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `characterIds` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `userIds` on the `card` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."card" DROP COLUMN "campaignIds",
DROP COLUMN "characterIds",
DROP COLUMN "creatorId",
DROP COLUMN "userIds",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "id" SET DEFAULT (concat('user:', gen_random_uuid()))::TEXT,
ALTER COLUMN "image" SET DEFAULT (concat('https://robohash.org/', random()))::TEXT;

-- CreateTable
CREATE TABLE "public"."passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3),
    "aaguid" TEXT,

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "mechanics" JSONB NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Character" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mechanics" JSONB NOT NULL,
    "deck" JSONB NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CardEditors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardEditors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CardViewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardViewers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CampaignGM" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignGM_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CampaignMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CharacterCampaign" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterCampaign_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CharacterViewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterViewers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CharacterCards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterCards_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_id_key" ON "public"."Campaign"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Character_id_key" ON "public"."Character"("id");

-- CreateIndex
CREATE INDEX "_CardEditors_B_index" ON "public"."_CardEditors"("B");

-- CreateIndex
CREATE INDEX "_CardViewers_B_index" ON "public"."_CardViewers"("B");

-- CreateIndex
CREATE INDEX "_CampaignGM_B_index" ON "public"."_CampaignGM"("B");

-- CreateIndex
CREATE INDEX "_CampaignMember_B_index" ON "public"."_CampaignMember"("B");

-- CreateIndex
CREATE INDEX "_CharacterCampaign_B_index" ON "public"."_CharacterCampaign"("B");

-- CreateIndex
CREATE INDEX "_CharacterViewers_B_index" ON "public"."_CharacterViewers"("B");

-- CreateIndex
CREATE INDEX "_CharacterCards_B_index" ON "public"."_CharacterCards"("B");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "public"."user"("id");

-- AddForeignKey
ALTER TABLE "public"."passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card" ADD CONSTRAINT "card_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Character" ADD CONSTRAINT "Character_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardEditors" ADD CONSTRAINT "_CardEditors_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardEditors" ADD CONSTRAINT "_CardEditors_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardViewers" ADD CONSTRAINT "_CardViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardViewers" ADD CONSTRAINT "_CardViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CampaignGM" ADD CONSTRAINT "_CampaignGM_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CampaignGM" ADD CONSTRAINT "_CampaignGM_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CampaignMember" ADD CONSTRAINT "_CampaignMember_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CampaignMember" ADD CONSTRAINT "_CampaignMember_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterCampaign" ADD CONSTRAINT "_CharacterCampaign_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterCampaign" ADD CONSTRAINT "_CharacterCampaign_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterViewers" ADD CONSTRAINT "_CharacterViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterViewers" ADD CONSTRAINT "_CharacterViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterCards" ADD CONSTRAINT "_CharacterCards_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CharacterCards" ADD CONSTRAINT "_CharacterCards_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `profileId` on the `Barcode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Barcode" DROP CONSTRAINT "Barcode_profileId_fkey";

-- AlterTable
ALTER TABLE "Barcode" DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;

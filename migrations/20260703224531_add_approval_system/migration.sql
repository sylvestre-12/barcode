-- DropIndex
DROP INDEX "Profile_username_key";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

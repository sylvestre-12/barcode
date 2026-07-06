/*
  Warnings:

  - You are about to drop the column `created_at` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `dismissed_at` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `dismissed_by` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `member_name` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `break_start_time` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `is_overtime` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `member_name` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `on_break` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `scanned_by` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `scanned_by_name` on the `AttendanceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `actor_id` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `actor_name` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `new_value` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `previous_value` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `target_id` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `target_type` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `LoginAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `target_role` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `two_fa_enabled` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `two_fa_secret` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationPref` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduledReport` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[barcode]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Made the column `dismissed` on table `Anomaly` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `student_id` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `AttendanceRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `AttendanceRecord` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `entity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `AuditLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `LoginAttempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `attempt_count` on table `LoginAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `read` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Anomaly" DROP CONSTRAINT "Anomaly_dismissed_by_fkey";

-- DropForeignKey
ALTER TABLE "Anomaly" DROP CONSTRAINT "Anomaly_member_id_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_member_id_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_scanned_by_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_created_by_fkey";

-- DropForeignKey
ALTER TABLE "NotificationPref" DROP CONSTRAINT "NotificationPref_user_id_fkey";

-- AlterTable
ALTER TABLE "Anomaly" DROP COLUMN "created_at",
DROP COLUMN "date",
DROP COLUMN "details",
DROP COLUMN "dismissed_at",
DROP COLUMN "dismissed_by",
DROP COLUMN "member_id",
DROP COLUMN "member_name",
ADD COLUMN     "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "dismissed" SET NOT NULL,
ALTER COLUMN "dismissed" SET DEFAULT false;

-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "break_start_time",
DROP COLUMN "is_overtime",
DROP COLUMN "member_id",
DROP COLUMN "member_name",
DROP COLUMN "notes",
DROP COLUMN "on_break",
DROP COLUMN "scanned_by",
DROP COLUMN "scanned_by_name",
ADD COLUMN     "student_id" TEXT NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "actor_id",
DROP COLUMN "actor_name",
DROP COLUMN "new_value",
DROP COLUMN "previous_value",
DROP COLUMN "target_id",
DROP COLUMN "target_type",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "username",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "attempt_count" SET NOT NULL,
ALTER COLUMN "attempt_count" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "created_by",
DROP COLUMN "scope",
DROP COLUMN "severity",
DROP COLUMN "target_role",
ALTER COLUMN "read" SET NOT NULL,
ALTER COLUMN "read" SET DEFAULT false,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "email_verified",
DROP COLUMN "isApproved",
DROP COLUMN "two_fa_enabled",
DROP COLUMN "two_fa_secret",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "NotificationPref";

-- DropTable
DROP TABLE "PendingRegistration";

-- DropTable
DROP TABLE "ScheduledReport";

-- CreateTable
CREATE TABLE "Barcode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT,

    CONSTRAINT "Barcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "qrCode" TEXT NOT NULL,
    "department" TEXT,
    "year" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Barcode_code_key" ON "Barcode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_qrCode_key" ON "Student"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_barcode_key" ON "Profile"("barcode");

-- AddForeignKey
ALTER TABLE "Barcode" ADD CONSTRAINT "Barcode_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barcode" ADD CONSTRAINT "Barcode_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

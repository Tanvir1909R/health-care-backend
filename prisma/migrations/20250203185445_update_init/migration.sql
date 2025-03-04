/*
  Warnings:

  - Changed the type of `roll` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roll",
ADD COLUMN     "roll" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "UserRoll";

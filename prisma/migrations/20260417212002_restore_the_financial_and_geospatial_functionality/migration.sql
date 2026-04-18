/*
  Warnings:

  - You are about to drop the column `address` on the `properties` table. All the data in the column will be lost.
  - Added the required column `encrypted_address` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "address",
ADD COLUMN     "encrypted_address" TEXT NOT NULL,
ADD COLUMN     "location" geometry(Point, 4326);

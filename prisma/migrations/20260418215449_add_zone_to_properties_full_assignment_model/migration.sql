-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED_NO_SHOW', 'AUTO_REASSIGNED', 'DISPUTED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "zone" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "provider_id" TEXT,
    "property_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "transitioned_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_provider_id_status_idx" ON "assignments"("provider_id", "status");

-- CreateIndex
CREATE INDEX "assignments_status_expires_at_idx" ON "assignments"("status", "expires_at");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

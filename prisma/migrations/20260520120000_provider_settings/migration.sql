-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "mobile_money_number" TEXT;

-- CreateTable
CREATE TABLE "provider_blocked_dates" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "blocked_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_blocked_dates_blocked_date_idx" ON "provider_blocked_dates"("blocked_date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_blocked_dates_provider_id_blocked_date_key" ON "provider_blocked_dates"("provider_id", "blocked_date");

-- AddForeignKey
ALTER TABLE "provider_blocked_dates" ADD CONSTRAINT "provider_blocked_dates_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


/*
  Warnings:

  - The values [pending_approval,completed,rejected] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[reversal_of_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionChannel" AS ENUM ('WEB', 'API', 'SYSTEM', 'IMPORT');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('DRAFT', 'PENDING', 'POSTED', 'REVERSED', 'REJECTED');
ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'POSTED';
COMMIT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "channel" "TransactionChannel" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "purpose_code" TEXT,
ADD COLUMN     "reversal_of_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'POSTED';

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reversal_of_id_key" ON "transactions"("reversal_of_id");

-- CreateIndex
CREATE INDEX "transactions_effective_date_idx" ON "transactions"("effective_date");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reversal_of_id_fkey" FOREIGN KEY ("reversal_of_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

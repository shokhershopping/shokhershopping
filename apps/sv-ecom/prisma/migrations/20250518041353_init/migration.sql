/*
  Warnings:

  - Added the required column `couponAppliedDiscount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemsTotalDiscount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWithDiscount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponAppliedDiscount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "itemsTotalDiscount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "netTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalWithDiscount" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

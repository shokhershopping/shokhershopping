/*
  Warnings:

  - You are about to drop the column `discountId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountId` on the `VariableProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discountId";

-- AlterTable
ALTER TABLE "VariableProduct" DROP COLUMN "discountId";

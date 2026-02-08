/*
  Warnings:

  - You are about to drop the `Discount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_discountId_fkey";

-- DropForeignKey
ALTER TABLE "VariableProduct" DROP CONSTRAINT "VariableProduct_discountId_fkey";

-- DropTable
DROP TABLE "Discount";

/*
  Warnings:

  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeGuide` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `VariableProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sizeGuideId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "images",
DROP COLUMN "sizeGuide",
ADD COLUMN     "sizeGuideId" TEXT;

-- AlterTable
ALTER TABLE "VariableProduct" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sizeGuideId_key" ON "Product"("sizeGuideId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sizeGuideId_fkey" FOREIGN KEY ("sizeGuideId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "VariableProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

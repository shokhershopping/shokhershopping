/*
  Warnings:

  - A unique constraint covering the columns `[imageFilename]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageFilename" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_imageFilename_key" ON "Category"("imageFilename");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageFilename_fkey" FOREIGN KEY ("imageFilename") REFERENCES "Image"("filename") ON DELETE SET NULL ON UPDATE CASCADE;

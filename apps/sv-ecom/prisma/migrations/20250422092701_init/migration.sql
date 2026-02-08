/*
  Warnings:

  - A unique constraint covering the columns `[slideImageFilename]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSlide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slideImageFilename" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slideImageFilename_key" ON "Category"("slideImageFilename");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_slideImageFilename_fkey" FOREIGN KEY ("slideImageFilename") REFERENCES "Image"("filename") ON DELETE SET NULL ON UPDATE CASCADE;

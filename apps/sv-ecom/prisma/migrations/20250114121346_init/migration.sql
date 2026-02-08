/*
  Warnings:

  - The primary key for the `Image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileName` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `folderName` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[filename]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `destination` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encoding` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldname` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalname` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_sizeGuideId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP CONSTRAINT "Image_pkey",
DROP COLUMN "fileName",
DROP COLUMN "folderName",
DROP COLUMN "id",
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "encoding" TEXT NOT NULL,
ADD COLUMN     "fieldname" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "originalname" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD CONSTRAINT "Image_pkey" PRIMARY KEY ("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Image_filename_key" ON "Image"("filename");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sizeGuideId_fkey" FOREIGN KEY ("sizeGuideId") REFERENCES "Image"("filename") ON DELETE SET NULL ON UPDATE CASCADE;

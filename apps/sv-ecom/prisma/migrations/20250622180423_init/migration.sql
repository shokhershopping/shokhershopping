/*
  Warnings:

  - The primary key for the `WishlistItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `iid` on the `WishlistItem` table. All the data in the column will be lost.
  - The required column `id` was added to the `WishlistItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_pkey",
DROP COLUMN "iid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id");

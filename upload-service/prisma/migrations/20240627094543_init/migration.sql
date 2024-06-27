/*
  Warnings:

  - You are about to drop the column `stream_url` on the `VideoData` table. All the data in the column will be lost.
  - Added the required column `input_bucket_url` to the `VideoData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoData" DROP COLUMN "stream_url",
ADD COLUMN     "input_bucket_url" TEXT NOT NULL;

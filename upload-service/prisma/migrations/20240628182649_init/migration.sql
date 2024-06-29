-- CreateTable
CREATE TABLE "VideoData" (
    "video_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "author" TEXT NOT NULL,
    "stream_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoData_pkey" PRIMARY KEY ("video_id")
);

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const addVideoDetailsToDB = async (title, description, author) => {
    const videoData = await prisma.videoData.create({
        data: {
            title, description, author
        }
    })

    return videoData
}
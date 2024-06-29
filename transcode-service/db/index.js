import {PrismaClient} from '@prisma/client'

const prisma=new PrismaClient()

export const updateStreamUrlInDb=async(video_id, url)=>{
    const videoData = await prisma.videoData.update({
        where: { video_id: Number(video_id) },
        data: { stream_url: url },
    })
    
    return videoData
}
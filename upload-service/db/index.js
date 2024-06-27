import {PrismaClient} from '@prisma/client'

const prisma=new PrismaClient()

export const addVideoDetailsToDB=async(title, description, author, url)=>{
    const videoData = await prisma.videoData.create({
        data:{
            title, description, author, input_bucket_url: url
        }
    })

    console.log(`Video meta data added to DB successfully: `, videoData)
}
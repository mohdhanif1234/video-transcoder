import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'

export const uploadFileToS3 = async (req, res) => {
    // console.log('upload file to s3')
    // res.send('cool')

    const filePath = '/Users/mohdhanif/practise/video-transcoder/upload-service/assets/images/360x249.jpeg'

    if (!fs.existsSync(filePath)) {
        console.log(`File does not exist in this path : ${filePath}`);
        return;
    }

    AWS.config.update({
        region: 'ap-south-1',
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })

    const params = {
        Bucket: process.env.AWS_INPUT_BUCKET,
        Key: '360x249.jpeg',
        Body: fs.createReadStream(filePath)
    }

    const s3 = new AWS.S3();

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(`Error occured while uploading the file: `, err);
            res.status(404).send('File could not be uploaded!');
        }
        else {
            console.log(`File location is: ${data.Location}`)
            res.status(200).send('File uploaded successfully!!!.')
        }
    })
}
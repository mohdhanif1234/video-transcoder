import AWS from 'aws-sdk';
import fs from 'fs'

export const uploadFileToS3 = async (req, res) => {

    const file = req.file;

    if (!file) {
        console.log('No file received');
        return res.status(404).send('No file received')
    }

    // const filePath = '/Users/mohdhanif/practise/video-transcoder/upload-service/assets/images/360x249.jpeg'

    // if (!fs.existsSync(filePath)) {
    //     console.log(`File does not exist in this path : ${filePath}`);
    //     return;
    // }

    AWS.config.update({
        region: 'ap-south-1',
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })

    // Generate folder name based on current date in DD/MM/YYYY format
    const currentDate = new Date();
    const folderName = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

    const params = {
        Bucket: process.env.AWS_INPUT_BUCKET,
        Key: `${folderName}/${file.originalname}`, // Include folder structure in Key
        Body: file.buffer
        // Body: fs.createReadStream(filePath)
    }

    const s3 = new AWS.S3();

    console.log('File upload to S3 starts...')

    s3.upload(params, (error, data) => {
        if (error) {
            console.log(`Error occured while uploading the file: `, error);
            res.status(404).send('File could not be uploaded!');
        }
        else {
            console.log(`File location is: ${data.Location}`)
            res.status(200).send('File uploaded successfully!!!.')
        }
    })
}
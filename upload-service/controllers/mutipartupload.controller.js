import AWS from 'aws-sdk'
import { addVideoDetailsToDB } from '../db/index.js'
import { pushVideoForEncodingToKafka } from './kafkapublisher.controller.js'

// Initialize upload
export const initializeMultipartUpload = async (req, res) => {
    try {
        console.log('Initialising Upload');
        const { filename } = req.body;
        console.log('Filename', filename);

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ap-south-1'
        });

        const bucketName = process.env.AWS_INPUT_BUCKET;

        const createParams = {
            Bucket: bucketName,
            Key: filename,
            ContentType: 'video/mp4'
        };

        const multipartParams = await s3.createMultipartUpload(createParams).promise()
        console.log("multipartparams---- ", multipartParams);
        const uploadId = multipartParams.UploadId;
        const S3Key=multipartParams.Key

        res.status(200).json({ uploadId, S3Key });
    } catch (err) {
        console.error('Error initializing upload:', err);
        res.status(500).send('Upload initialization failed');
    }
};

// Upload chunk
export const uploadChunk = async (req, res) => {
    try {
        console.log('Uploading Chunk');
        const { filename, chunkIndex, uploadId } = req.body;
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ap-south-1'
        });
        const bucketName = process.env.AWS_INPUT_BUCKET;

        const partParams = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
            PartNumber: parseInt(chunkIndex) + 1,
            Body: req.file.buffer,
        };

        const data = await s3.uploadPart(partParams).promise();
        console.log("data------- ", data);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error uploading chunk:', err);
        res.status(500).send('Chunk could not be uploaded');
    }
};

// Complete upload
export const completeUpload = async (req, res) => {
    try {
        console.log('Completing Upload starts...');
        const { filename, totalChunks, uploadId, title, description, author, S3Key } = req.body;

        // const uploadedParts = [];

        // // Build uploadedParts array from request body
        // for (let i = 0; i < totalChunks; i++) {
        //     uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
        // }

        // console.log('Uploaded Parts....', uploadedParts)

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ap-south-1'
        });

        const bucketName = process.env.AWS_INPUT_BUCKET;

        // Generate folder name based on current date in DD/MM/YYYY format
        const currentDate = new Date();
        const folderName = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

        const completeParams = {
            Bucket: bucketName,
            Key: filename, // Include folder structure in Key
            UploadId: uploadId,
        };

        // Listing parts using promise
        const data = await s3.listParts(completeParams).promise();

        const parts = data.Parts.map(part => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));

        completeParams.MultipartUpload = {
            Parts: parts
        };

        // Completing multipart upload using promise
        const uploadResult = await s3.completeMultipartUpload(completeParams).promise();

        console.log('Upload to s3 input bucket is completed...')

        console.log("data----- ", uploadResult);

        // const signedUrl = await getSignedUrl(uploadResult.Key)

        // console.log(`Signed url is`, signedUrl)

        const videoData = await addVideoDetailsToDB(title, description, author);
        console.log(`Video meta data added to DB successfully: `, videoData);

        const { video_id } = videoData

        await pushVideoForEncodingToKafka(title, uploadResult.Location, video_id, S3Key);

        return res.status(200).send({ message: " File Uploaded successfully!!!" });

    } catch (error) {
        console.log('Error completing upload :', error);
        return res.status(500).send('Upload completion failed');
    }
};

export const getSignedUrl = (videoKey) => {

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1'
    });

    const params = {
        Bucket: process.env.AWS_INPUT_BUCKET,
        Key: videoKey,
        Expires: 1800 // this URL will expire in 30 mins
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}

export const generatePresignedURLs = async (req, res) => {
    // get values from req body
    const { fileName, uploadId, partNumbers } = req.body;
    const totalParts = Array.from({ length: partNumbers }, (_, i) => i + 1);

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1'
    });

    try {


        const presignedUrls = [];

        for (let partNumber of totalParts) {
            const params = {
                Bucket: process.env.AWS_INPUT_BUCKET,
                Key: fileName,
                PartNumber: partNumber,
                UploadId: uploadId,
                Expires: 1800, // URL expiration time in seconds (e.g., 30 minutes)
            };

            const url = await s3.getSignedUrlPromise('uploadPart', params);
            presignedUrls.push({ partNumber, url });
        }


        res.status(200).json({ presignedUrls });
    } catch (error) {
        console.error("Error generating pre-signed URLs:", error);
        return res.status(500).json({ error: "Error generating pre-signed URLs" });
    }
}

export const completeMultipartUpload = async (req, res) => {
    try {

        const { fileName, uploadId, parts } = req.body;

        const params = {
            Bucket: process.env.AWS_INPUT_BUCKET,
            Key: fileName,

            MultipartUpload: {
                Parts: parts.map((part, index) => ({
                    ETag: part.etag,
                    PartNumber: index + 1,
                })),
            },
        };

        console.log('Complete multipart upload starts......')

        const data = await s3.completeMultipartUpload(params).promise();

        console.log('Multipart upload on S3 completed....')

        console.log('Data after multipart upload on s3....', data)
        res.status(200).json({ fileData: data });

    } catch (error) {

    }
}
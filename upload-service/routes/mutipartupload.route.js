import { Router } from 'express'
import multer from 'multer'
import { initializeMultipartUpload, uploadChunk, completeUpload, generatePresignedURLs, completeMultipartUpload } from "../controllers/mutipartupload.controller.js";
const upload = multer()

const router = Router();

// Route to initialize multipart upload
router.route('/initializeMultiPartUpload').post(upload.none(), initializeMultipartUpload);

// Route to upload individual chunks
router.route('/uploadChunk').post(upload.single('chunk'), uploadChunk);

// Route to complete upload file
router.route('/completeUpload').post(completeUpload)

//Route to generate pre signed urls
router.route('/generatePresignedURLs').post(generatePresignedURLs)

// Route to complete multipart upload after getting presigned urls for each individual chunks
router.route('/completeMultiPartUpload').post(completeMultipartUpload)

export default router
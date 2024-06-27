import { Router } from 'express'
import multer from 'multer'
import { initializeMultipartUpload, uploadChunk, completeUpload } from "../controllers/mutipartupload.controller.js";
const upload = multer()

const router = Router();

// Route to initialize multipart upload
router.route('/initializeMultiPartUpload').post(upload.none(), initializeMultipartUpload);

// Route to upload individual chunks
router.route('/uploadChunk').post(upload.single('chunk'), uploadChunk);

// Route to complete upload file
router.route('/completeUpload').post(completeUpload)

export default router
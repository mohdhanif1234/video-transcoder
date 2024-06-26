import { Router } from 'express'
import multer from 'multer'
import { uploadFileToS3 } from '../controllers/upload.controller.js';

const upload = multer();

const router = Router()

router.route('/upload').post(upload.single('file'), uploadFileToS3)

export default router
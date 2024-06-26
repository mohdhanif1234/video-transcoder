import {Router} from 'express'
import multer from 'multer'
import { uploadFileToS3 } from '../controllers/upload.controller.js';

const upload=multer();

const router=Router()

router.post('/upload', uploadFileToS3)

export default router
import { Router } from 'express'
import { convertToHLS, s3InputTos3Output } from '../controllers/transode.controller.js'

const router = Router()

// router.route('/transcode').get(convertToHLS)

router.route('/transcode').get(s3InputTos3Output)

export default router
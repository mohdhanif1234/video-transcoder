import express, { Router } from 'express';
import { publishMessageToKafka } from '../controllers/kafkapublisher.controller.js';

const router = Router()

router.route('/publish').post(publishMessageToKafka)

export default router
import { Router } from "express";
import { getAllVideos } from "../controllers/home.controller.js";

const router = Router();

router.route('/home').get(getAllVideos)

export default router
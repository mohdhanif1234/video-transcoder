import { Router } from "express";
import { watchVideo } from "../controllers/watch.controller.js";
import { getAllVideos } from "../controllers/home.controller.js";

const router = Router();

router.route('/watch').get(watchVideo)

router.route('/home').get(getAllVideos)

export default router
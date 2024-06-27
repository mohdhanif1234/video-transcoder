import { Router } from "express";
import { watchVideo } from "../controllers/watch.controller";

const router = Router();

router.route('/watch').get(watchVideo)

export default router
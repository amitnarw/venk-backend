import { alreadyPlaying } from "../controllers/rooms.controller";
import express from "express";

const router = express();

router.route("/").get().post();
router.route("/:roomId").get().put().delete();
router.route("/alreadyPlaying").get(alreadyPlaying);

export default router;
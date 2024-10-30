import express from "express";

const router = express();

router.route("/").get().post();
router.route("/:roomId").get().put().delete();

export default router;
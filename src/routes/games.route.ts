import express from "express";

const router = express();

router.route("/").get().post();
router.route("/:gameId").get().put().delete();
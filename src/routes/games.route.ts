import { createGame, getAllGames } from "../controllers/games.controller";
import express from "express";

const router = express();

router.route("/").get(getAllGames).post(createGame);
router.route("/:gameId").get().put().delete();

export default router;
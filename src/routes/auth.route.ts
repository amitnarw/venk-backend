import { userLogin, userRegister } from "controllers/users.controller";
import express from "express";

const router = express();

router.route("/login").post(userLogin);
router.route("/register").post(userRegister);

export default router;
import { userLogin, userLogout, userRegister } from "../controllers/auth.controller";
import express from "express";

const router = express();

router.route("/login").post(userLogin);
router.route("/register").post(userRegister);
router.route("/logout").post(userLogout);

export default router;
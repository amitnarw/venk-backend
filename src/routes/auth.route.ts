import accessControl from "../middlewares/accessControl";
import { userLogin, userLogout, userRegister } from "../controllers/auth.controller";
import express from "express";

const router = express();

router.route("/login").post(userLogin);
router.route("/register").post(userRegister);
router.route("/logout").get(accessControl, userLogout);

export default router;
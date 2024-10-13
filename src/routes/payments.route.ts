import express from "express";
import { createUserPaymentMethod, getUserPaymentMethods } from "../controllers/user-payments.controller";
const router = express();

router.route("/:userId").get(getUserPaymentMethods);
router.route("/").post(createUserPaymentMethod);

export default router;
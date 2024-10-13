import { createUserTransaction, getUserDetails, getUserTransactions } from "../controllers/users.controller";
import express from "express";

const router = express();

router.route("/:userId/details").get(getUserDetails);
router.route("/:userId/transactions").get(getUserTransactions);
router.route("/transactions").post(createUserTransaction)

export default router;
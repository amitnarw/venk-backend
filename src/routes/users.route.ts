import { createUserTransaction, getUserDetails, getUserTransactions } from "controllers/users.controller";
import express from "express";

const router = express();

router.route("/:id/details").get(getUserDetails);
router.route("/:id/transactions").get(getUserTransactions).post(createUserTransaction);

export default router;
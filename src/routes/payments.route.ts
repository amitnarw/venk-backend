import { getPaymentMethods } from "controllers/payments.controller";
import express from "express";
const router = express();

router.route("/get").get(getPaymentMethods);
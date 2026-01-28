import express from "express";
import { getOrders, payOrder } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/orders", getOrders);
paymentRouter.post("/pay", payOrder);

export default paymentRouter;
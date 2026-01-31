

import express from 'express'
import { createOrder, getOrders, payOrder, updateorderstatus } from '../controllers/orderController.js';

const orderRouter =express.Router();
orderRouter.get("/",getOrders)
orderRouter.post("/",createOrder)
orderRouter.put("/status/:orderID",updateorderstatus)
orderRouter.put("/:orderID/pay",payOrder)

export default orderRouter;


import express from 'express'
import { createOrder, getOrders, updateorderstatus } from '../controllers/orderController.js';

const orderRouter =express.Router();
orderRouter.get("/",getOrders)
orderRouter.post("/",createOrder)
orderRouter.put("/status/:orderID",updateorderstatus)

export default orderRouter;
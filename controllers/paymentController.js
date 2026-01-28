import Order from "../models/order.js";
import Payment from "../models/payment.js";



export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // IMPORTANT
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const payOrder = async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ message: "orderID required" });
    }

    const order = await Order.findOne({ orderID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Payment.create({
      orderID: order.orderID,
      customerName: order.customerName,
      email: order.email,
      amount: order.total,
    });

    order.status = "paid";
    await order.save();

    res.status(200).json({ message: "Payment successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
};

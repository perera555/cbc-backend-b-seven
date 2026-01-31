import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin, iscustomer } from "./userController.js";

/* =====================================================
   CREATE ORDER
   ===================================================== */

export async function createOrder(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    // Generate order ID
    const orderList = await Order.find().sort({ date: -1 }).limit(1);

    let newOrderID = "CBC0000001";
    if (orderList.length !== 0) {
      const lastID = orderList[0].orderID.replace("CBC", "");
      const nextID = (parseInt(lastID) + 1).toString().padStart(7, "0");
      newOrderID = "CBC" + nextID;
    }

    // Customer info
    let customerName = req.body.customerName;
    if (!customerName) {
      customerName = user.firstName + " " + user.lastName;
    }

    let phone = req.body.phone || "Not Provided";

    // Validate items
    const itemsInRequest = req.body.items;
    if (!Array.isArray(itemsInRequest)) {
      return res.status(400).json({ message: "Items should be an array" });
    }

    const itemsToBeAdded = [];
    let total = 0;

    for (let i = 0; i < itemsInRequest.length; i++) {
      const item = itemsInRequest[i];

      const product = await Product.findOne({
        productID: item.productId,
      });

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productId}`,
          availableStock: product.stock,
        });
      }

      itemsToBeAdded.push({
        productID: product.productID,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0],
      });

      total += product.price * item.quantity;
    }

    // Create order
    const newOrder = new Order({
      orderID: newOrderID,
      Item: itemsToBeAdded,
      customerName,
      email: user.email,
      phone,
      address: req.body.address,
      total,
    });

    await newOrder.save();

    // Update product stock
    for (let i = 0; i < itemsToBeAdded.length; i++) {
      const item = itemsToBeAdded[i];
      await Product.updateOne(
        { productID: item.productID },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: "Order Created Successfully",
      orderID: newOrderID,
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/* =====================================================
   GET ORDERS
   ===================================================== */

export async function getOrders(req, res) {
  try {
    if (isAdmin(req)) {
      const orders = await Order.find().sort({ date: -1 });
      return res.json(orders);
    }

    if (iscustomer(req)) {
      const user = req.user;
      const orders = await Order.find({ email: user.email }).sort({ date: -1 });
      return res.json(orders);
    }

    return res.status(403).json({
      message: "You are not authorized to view orders",
    });

  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
}

/* =====================================================
   UPDATE ORDER STATUS (ADMIN)
   ===================================================== */

export async function updateorderstatus(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update order status",
    });
  }

  try {
    const orderID = req.params.orderID;
    const newstatus = req.body.status;

    await Order.updateOne(
      { orderID },
      { $set: { status: newstatus } }
    );

    res.json({
      message: "Order status updated successfully",
    });

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({
      message: "Failed to update order status",
    });
  }
}

/* =====================================================
   PAY ORDER
   ===================================================== */

export async function payOrder(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const orderID = req.params.orderID;
    const order = await Order.findOne({ orderID });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only owner or admin can pay
    if (order.email !== user.email && !isAdmin(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Update payment
    order.paymentStatus = "PAID";
    order.paymentMethod = req.body.paymentMethod || "CARD";
    order.paidAt = new Date();
    order.paymentReference = req.body.paymentReference || null;

    await order.save();

    res.status(200).json({
      message: "Payment successful",
      order,
    });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ message: "Payment failed" });
  }
}

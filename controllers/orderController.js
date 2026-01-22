import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const orderList = await Order.find().sort({ date: -1 }).limit(1);

    let newOrderID = "CBC0000001";
    if (orderList.length !== 0) {
      const lastID = orderList[0].orderID.replace("CBC", "");
      const nextID = (parseInt(lastID) + 1).toString().padStart(7, "0");
      newOrderID = "CBC" + nextID;
    }

    let customerName = req.body.customerName;
    if (!customerName) {
      customerName = user.firstName + " " + user.lastName;
    }

    let phone = req.body.phone || "Not Provided";

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
    // order count
    for (let i= 0; i<itemsToBeAdded.length; i++) {
      const item =itemsToBeAdded[i]
      await Product.updateOne(
        {productID:item.productID},
        {$inc:{stock:-item.quantity}}
      )

    }

    res.status(201).json({ message: "Order Created Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function getOrders(req, res) {
  if (isAdmin(req)) {
    const orders = await Order.find().sort({ date: -1 })
    res.json(orders)

  } else if (iscustomer(req)) {
    const user = req.user
    const orders = await Order.find({ email: user.email }).sort({ date: -1 })
    res.json(orders)

  } else {
    res.status(403).json({
      message: "you are not Authorized tho view orders"
    })
  }
}

export async function updateorderstatus(req, res) {

  if (!isAdmin(req)) {
    res.status(403).json({
      message: "you are not Authorized to update order"
    });
    return;
  }

  try {
    const orderID = req.params.orderID;
    const newstatus = req.body.status;

    await Order.updateOne(
      { orderID: orderID },
      { $set: { status: newstatus } }
    );

    res.json({
      message: "Order status updated successfully"
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      message: "failed to update order status"
    });
  }
}

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    unique: true,
  },

  Item: [
    {
      productID: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],

  customerName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    default: "pending",
  },

  /* ================= PAYMENT DETAILS ================= */

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
  },

  paymentMethod: {
    type: String,
    default: "CARD",
  },

  paidAt: {
    type: Date,
  },

  paymentReference: {
    type: String,
  },

  /* =================================================== */

  date: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
  },
  customerName: String,
  email: String,
  amount: Number,
  paymentMethod: {
    type: String,
    default: "Card",
  },
  paymentStatus: {
    type: String,
    default: "success",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true   // ❗ FIX: NOT unique
    },
    otp: {
      type: String,
      required: true,
    },
  }
);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;

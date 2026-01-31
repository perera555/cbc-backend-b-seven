import express from "express";

import {
  createUser,
  loginUser,
  getUsers,
  getUser,
  getAllUsers,
  blockOrUnblockUser,
  sentOTP,
  changePassswordViaOTP,
  updateuserData,
  upadtePassword
} from "../controllers/userController.js";

const userRouter = express.Router();

/* ================= AUTH ================= */
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

/* ================= USER ================= */
userRouter.get("/me", getUser);
userRouter.get("/", getUsers);
userRouter.get("/all", getAllUsers);

/* ================= OTP / PASSWORD ================= */
userRouter.post("/otp", sentOTP);
userRouter.post("/reset-password", changePassswordViaOTP);
userRouter.put("/password", upadtePassword);

/* ================= PROFILE ================= */
userRouter.put("/update", updateuserData);

/* ================= ADMIN ================= */
userRouter.put("/block/:email", blockOrUnblockUser);

export default userRouter;

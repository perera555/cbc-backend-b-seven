import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

/* ================= ROUTERS ================= */
import studentRouter from "./routes/studentsRouter.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import orderRouter from "./routes/orderRouter.js";

/* ================= CONFIG ================= */
dotenv.config();
const app = express();

/* ================= GLOBAL MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= GLOBAL JWT MIDDLEWARE ================= */
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // public route
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ attach user
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token, please login again",
    });
  }
});

/* ================= CONTEXT MIDDLEWARE ================= */
function userContext(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized – please login",
    });
  }
  next();
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized – please login",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied – admin only",
    });
  }

  next();
}

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to the database successfully"))
  .catch((err) => console.log("❌ DB Error:", err));

/* ================= ROUTES ================= */

// users (public)
app.use("/api/users", userRouter);

// students (logged users)
app.use("/api/students", userContext, studentRouter);

// products
app.use(
  "/api/products",
  (req, res, next) => {
    if (req.method === "GET") return next();
    return adminOnly(req, res, next);
  },
  productRouter
);

// orders + payments (logged users)
app.use("/api/orders", userContext, orderRouter);

// reviews (public)
app.use("/api/reviews", reviewRouter);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("API is running");
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from "cors";
import dotenv from 'dotenv';

import studentRouter from './routes/studentsRouter.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import orderRouter from './routes/orderRouter.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

/* ================= AUTH (UNCHANGED) ================= */
app.use((req, res, next) => {
    let token = req.header('Authorization');

    if (token) {
        token = token.replace("Bearer ", "");
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (decoded == null) {
                return res.status(401).json({
                    message: "Invalid Token please login again"
                });
            }
            req.user = decoded;
        });
    }
    next();
});

/* ================= MIDDLEWARE ================= */
function userContext(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized – please login"
        });
    }
    next();
}

function adminOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized – please login"
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied – admin only"
        });
    }
    next();
}

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to the database successfully"))
    .catch(err => console.log("DB Error", err));

/* ================= ROUTES ================= */

// users
app.use('/api/users', userRouter);

// students (logged users)
app.use('/api/students', userContext, studentRouter);

// products
app.use('/api/products', (req, res, next) => {
    if (req.method === "GET") {
        return next(); // public
    }
    return adminOnly(req, res, next); // admin only
}, productRouter);

// orders (logged users)
app.use('/api/orders', userContext, orderRouter);

// reviews (public)
app.use('/api/reviews', reviewRouter);

/* ================= SERVER ================= */
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

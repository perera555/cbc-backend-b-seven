import express from 'express';
import mongoose from 'mongoose';
import studentRouter from './routes/studentsRouter.js';
import userRouter from './routes/userRouter.js';
import jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import cors from "cors";
import dotenv from 'dotenv';


dotenv.config();
const app = express();
app.use(cors())
//middleware to parse json data
app.use(express.json());


//middleware to log http requests
//Authentication 
app.use(
    (req, res, next) => {
        let token = req.header('Authorization');

        if (token != null) {
            token = token.replace("Bearer ", "");
            console.log(token)
            jwt.verify(token, process.env.JWT_SECRET,
                (err, decoded) => {

                    if (decoded == null) {
                        res.status(401).json({
                            message: "Invalid Token please login again"
                        })
                        return
                    } else {
                        console.log(decoded)
                        req.user = decoded;

                    }
                }) // decrypt the token
        }
        next();
    }
)

const connectionString = process.env.MONGO_URI
mongoose.connect(connectionString)
    .then(
        () => {
            console.log("Connected to the database successfully");

        })
    .catch((err) => {
        console.log("Error connecting to the database",err);

    })


app.use('/students', studentRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/reviews', reviewRouter);


app.listen(3000,
    () => {
        console.log("Server is running on port 3000");



    }); 
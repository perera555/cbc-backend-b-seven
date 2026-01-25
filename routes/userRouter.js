import express from 'express';
import { createUser, getUser, getUsers, googleLogin, loginUser } from '../controllers/userController.js';


const userRouter = express.Router();


userRouter.get('/', getUsers);

userRouter.post("/", createUser)

userRouter.post("/login", loginUser)

userRouter.get("/me", getUser)

userRouter.post("/google-login", googleLogin)
 


 
export default userRouter;
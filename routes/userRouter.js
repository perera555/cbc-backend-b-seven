import express from 'express';
import { blockOrUnblockUser, changePassswordViaOTP, createUser, getAllUsers, getUser, getUsers, googleLogin, loginUser, sentOTP } from '../controllers/userController.js';


const userRouter = express.Router();


userRouter.get('/', getUsers);

userRouter.post("/", createUser)

userRouter.post("/login", loginUser)

userRouter.get("/me", getUser)

userRouter.post("/google-login", googleLogin)

userRouter.get('/all-users', getAllUsers);

userRouter.put('/block/:email', blockOrUnblockUser);

userRouter.get('/send-otp/', sentOTP);

userRouter.post("/reset-password", changePassswordViaOTP);
 


 
export default userRouter;  
import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {
    const hashedpassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedpassword,
        role: req.body.role,
    });

    user.save()
        .then(() => {
            res.status(201).json({
                message: "User created successfully",
            });
        })
        .catch(() => {
            res.status(500).json({
                message: "Error creating user",
            });
        });
}

export function getUsers(req, res) {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch(() => {
            res.status(500).json({
                message: "Error retrieving user data",
            });
        });
}

export function loginUser(req, res) {
    User.findOne({ email: req.body.email }).then((user) => {
        if (user == null) {
            res.status(404).json({
                message: "user not found",
            });
        } else {
            const isPasswordMatching = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (isPasswordMatching) {
                const token = jwt.sign(
                    {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        Images: user.Images,
                    },
                    process.env.JWT_SECRET
                );

                res.status(200).json({
                    message: "login successful",
                    token: token,
                    user: {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                    },
                });
            } else {
                res.status(401).json({
                    message: "incorrect password",
                });
            }
        }
    });
}

export function getUser(req, res) {
    if (req.user == null) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    res.json({
        user: req.user,
    });
}

export function isAdmin(req) {
    if (req.user == null) return false;
    if (req.user.role !== "admin") return false;
    return true;
}

export function isCustomer(req) {
    if (req.user == null) return false;
    if (req.user.role !== "user") return false;
    return true;
}

/* ================= GOOGLE LOGIN FIX ================= */

export async function googleLogin(req, res) {
    const token = req.body.token;

    if (token == null) {
        res.status(400).json({
            message: "Token is required",
        });
        return;
    }

    try {
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const googleUser = googleResponse.data;


        const user = await User.findOne({ 
            email: googleUser.email 
        });
        if(user == null){
            //create new user
            const newUser = new User({
                email: googleUser.email,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                password: "abc", //random password
                isEmailVerified: googleUser.email_verified,
                image: googleUser.picture,
            });

           let savedUser = await newUser.save();

            const jwtToken = jwt.sign(
                {
                    email: savedUser.email,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    role: savedUser.role,
                    isEmailVerified: savedUser.isEmailVerified,
                    Images: savedUser.image,
                },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                message: "Google login successful",
                token: jwtToken,
                user: {
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    isEmailVerified: newUser.isEmailVerified,
                    image: newUser.image,
                },
            });
            return;
        } else {
            //login existing user
            const jwtToken = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    Images: user.image,
                },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                message: "Google login successful",
                token: jwtToken,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image,
                },
            });
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({
            message: "Error during Google login",
        });
    }
}

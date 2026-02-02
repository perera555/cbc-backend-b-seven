import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import User from "../models/user.js";
import OTP from "../models/otpModel.js";
import getDesignEmail from "../lib/emailDesginer.js";

dotenv.config();

/* ================= CONFIG ================= */

const companyName = "Crystal Beauty Clear";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

/* ================= AUTH ================= */

export function createUser(req, res) {
  const hashedpassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedpassword,
    role: req.body.role,
  });

  user
    .save()
    .then(() =>
      res.status(201).json({ message: "User created successfully" })
    )
    .catch(() =>
      res.status(500).json({ message: "Error creating user" })
    );
}

export function loginUser(req, res) {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isblocked)
      return res.status(403).json({
        message: "User is blocked. Please contact support.",
      });

    const isPasswordMatching = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordMatching)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        image: user.image,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  });
}

/* ================= GOOGLE LOGIN (FIXED) ================= */

export async function googleLogin(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // Verify token with Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const {
      email,
      given_name,
      family_name,
      picture,
    } = googleRes.data;

    let user = await User.findOne({ email });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        email,
        firstName: given_name || "Google",
        lastName: family_name || "User",
        password: bcrypt.hashSync(
          Math.random().toString(36),
          10
        ),
        role: "user",
        isEmailVerified: true,
        image: picture,
      });
    }

    if (user.isblocked) {
      return res.status(403).json({
        message: "User is blocked. Please contact support.",
      });
    }

    // Create JWT (same pattern as loginUser)
    const jwtToken = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        image: user.image,
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
      },
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    res.status(401).json({
      message: "Google authentication failed",
    });
  }
}

/* ================= USERS ================= */

export function getUsers(req, res) {
  User.find()
    .then((users) => res.json(users))
    .catch(() =>
      res.status(500).json({ message: "Error retrieving user data" })
    );
}

export function getUser(req, res) {
  if (!req.user)
    return res.status(401).json({ message: "Unauthorized" });

  res.json({ user: req.user });
}

/* ================= ROLE CHECKS ================= */

export function isAdmin(req) {
  return req.user && req.user.role === "admin";
}

export function isCustomer(req) {
  return req.user && req.user.role === "user";
}

export const iscustomer = isCustomer;

/* ================= ADMIN ================= */

export async function getAllUsers(req, res) {
  if (!isAdmin(req))
    return res.status(403).json({ message: "Forbidden: Admins only" });

  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch {
    res.status(500).json({ message: "Error retrieving users" });
  }
}

export async function blockOrUnblockUser(req, res) {
  if (!isAdmin(req))
    return res.status(403).json({ message: "Forbidden: Admins only" });

  if (req.user.email === req.params.email)
    return res
      .status(400)
      .json({ message: "Admin cannot block/unblock themselves" });

  try {
    await User.updateOne(
      { email: req.params.email },
      { isblocked: req.body.isblocked }
    );

    res.status(200).json({
      message: "User block status updated successfully",
    });
  } catch {
    res.status(500).json({
      message: "Error blocking/unblocking user",
    });
  }
}

/* ================= OTP ================= */

export async function sentOTP(req, res) {
  const email = req.body.email || req.query.email;

  if (!email)
    return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    await transporter.sendMail({
      from: `"${companyName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP)",
      html: getDesignEmail({
        otp,
        companyName,
        expiryMinutes: 10,
      }),
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP ERROR:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
}

export async function changePassswordViaOTP(req, res) {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord)
      return res
        .status(400)
        .json({ message: "Invalid OTP or email" });

    await OTP.deleteMany({ email });

    const hashedpassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email }, { password: hashedpassword });

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error changing password" });
  }
}

/* ================= PROFILE ================= */

export async function updateuserData(req, res) {
  if (!req.user)
    return res.status(401).json({ message: "Unauthorized" });

  try {
    await User.updateOne(
      { email: req.user.email },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        image: req.body.image,
      }
    );

    const updatedUser = await User.findOne({ email: req.user.email });

    res.status(200).json({
      message: "User data updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user data" });
  }
}

export async function upadtePassword(req, res) {
  if (!req.user)
    return res.status(403).json({ message: "Forbidden" });

  try {
    const hashedpassword = bcrypt.hashSync(req.body.password, 10);
    await User.updateOne(
      { email: req.user.email },
      { password: hashedpassword }
    );

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating password" });
  }
}

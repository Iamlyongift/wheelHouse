import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinaryV2 } from "cloudinary";

import UserModel from "../models/UserModel";
import WishlistModel from "../models/whishlistModel";
import transport from "../emailConfig";

import AdminRequest from "../types/UserRequest";
import {
  LoginSchema,
  RegisterSchema,
  updateProfileSchema,
  userIdSchema,
  wishlistSchema,
} from "../utils/utils";

const jwtsecret = process.env.JWT_SECRET as string;

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      confirm_password,
      phoneNumber,
      country,
      role,
    } = req.body;

    console.log("📥 Incoming registration request:", req.body);
    console.log("📸 Uploaded file info:", req.file);

    // Validate input
    const { error } = RegisterSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.error("❌ Validation failed:", error.details);
      return res.status(400).json({
        error: error.details.map((err: any) => err.message),
      });
    }

    // Check password match
    if (password !== confirm_password) {
      console.warn("❌ Passwords do not match");
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.warn("⚠️ User already exists with email:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Handle file upload
    let pictureUrl = "";
    if (req.file) {
      try {
        const uploadResult = await cloudinaryV2.uploader.upload(req.file.path);
        pictureUrl = uploadResult.secure_url;
        console.log("✅ Image uploaded to Cloudinary:", pictureUrl);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload failed:", uploadErr);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Create user
    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHash,
      phoneNumber,
      country,
      profilePhoto: pictureUrl,
      role,
      isActive: false,
    });

    console.log("✅ User created successfully:", newUser._id);

    // Email verification setup
    const verificationToken = jwt.sign(
      { userId: newUser._id },
      jwtsecret,
      { expiresIn: "1h" }
    );

    const verificationUrl = `https://wheelhouse.onrender.com/users/verify-email?token=${verificationToken}`;
    const emailBackgroundUrl = "https://res.cloudinary.com/dsn2tjq5l/image/upload/v1729766502/lgyumyemlou8wgftaoew.jpg";

    if (!process.env.EMAIL_USER) {
      console.error("❌ EMAIL_USER is not defined in .env");
      return res.status(500).json({ error: "Email configuration missing" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <body style="background-image:url('${emailBackgroundUrl}'); background-size:contain; background-position:center; width: 100%; background-repeat: no-repeat;">
          <div style="max-width:600px; margin: 14rem auto; padding:20px; line-height: 1.6; color:white; text-align: justify">
            <h2>Welcome to Cribs&rides! 🎉</h2><br>
            We're thrilled to have you join our BILLIONAIRE'S community, where finding your dream home or the perfect ride is made easy and enjoyable.<br><br>
            <strong>What You Can Expect:</strong><br>
            - Exclusive Listings<br>
            - Personalized Experience<br>
            - Dedicated Support<br><br>
            Thank you for choosing Cribs&rides – we can't wait to help you find your perfect match!<br><br>
            <strong>Click below to verify your account:</strong><br>
            <a href="${verificationUrl}">👉 Verify your account</a>
          </div>
        </body>
        </html>
      `,
    };

    console.log("📤 Sending verification email to:", newUser.email);

    try {
      await transport.sendMail(mailOptions);
      console.log("✅ Verification email sent.");
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr);
      return res.status(500).json({ error: "Email sending failed" });
    }

    return res.status(201).json({
      msg: "Registration successful! Please check your email to verify your account.",
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    // Verify token
  const decoded = jwt.verify(token as string, jwtsecret) as { id: string };

    // Find and activate user
   
const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "Account already verified." });
    }

    user.isActive = true;
    await user.save();

    // Redirect to login page after successful verification
    res.redirect("https://wheelhouse.onrender.com/users/login");
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    const validateUser = LoginSchema.validate(req.body, { abortEarly: false });
    if (validateUser.error) {
      return res.status(400).json({ Error: validateUser.error.details[0].message });
    }

    // Verify if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    console.log("User found:", user);

    // Compare password
    const validUser = await bcrypt.compare(password, user.password);
    if (!validUser) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id }, jwtsecret, { expiresIn: "30d" });
    return res.status(200).json({
      msg: "Login Successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req: AdminRequest, res: Response) => {
  try {
    const { username, password, confirm_password } = req.body;

    // Validate request body
    console.log("Validating request body...");
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log("Validation error:", error.details);
      return res.status(400).json({
        Error: error.details.map((err: any) => err.message),
      });
    }

    // Ensure passwords match if password is provided
    if (password && password !== confirm_password) {
      return res.status(400).json({ Error: "Passwords do not match" });
    }

    // Hash password if provided
    let passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      console.log("Salt:", salt);
      console.log("Password:", password);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Handle file upload if present
    let pictureUrl = "";
    if (req.file) {
      const result = await cloudinaryV2.uploader.upload(req.file.path);
      pictureUrl = result.secure_url;
    }

    // Prepare update data
    const updateData: any = { username };
    if (passwordHash) updateData.password = passwordHash;
    if (pictureUrl) updateData.profilePhoto = pictureUrl;

    // Update user profile
    const profile = await UserModel.findByIdAndUpdate(req.user?._id, updateData, { new: true });
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", profile });
  } catch (error: any) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { error, value } = wishlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId, items } = value;

    let wishlist = await WishlistModel.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new WishlistModel({ user: userId, items });
    } else {
      wishlist.items = [...wishlist.items, ...items];
    }

    await wishlist.save();

    res.status(200).json({
      message: "Wishlist updated successfully",
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating wishlist",
      error: (err as Error).message,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // Validate the userId parameter
    const { error, value } = userIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId } = value;

    // Find user by ID (exclude password)
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving user profile",
      error: (err as Error).message,
    });
  }
};
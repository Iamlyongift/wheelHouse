import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
import { v2 as cloudinaryV2 } from "cloudinary";
import {
  cartSchema,
  LoginSchema,
  orderHistorySchema,
  RegisterSchema,
  updateProfileSchema,
  userIdSchema,
  wishlistSchema,
} from "../utils/utils";
import OrderModel from "../models/OrderModel";
import WishlistModel from "../models/whishlistModel";
import CartModel from "../models/CartModel";
import transport from "../emailConfig";


const jwtsecret = process.env.JWT_SECRET as string;

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      confirm_password,
      phone_number,
      country,
      role,
    } = req.body;

    console.log("Received registration data:", req.body);

    // Validate user input
    const { error } = RegisterSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.error("Validation error:", error.details);
      return res
        .status(400)
        .json({ Error: error.details.map((err: any) => err.message) });
    }

    // Ensure passwords match
    if (password !== confirm_password) {
      console.error("Password mismatch:", { password, confirm_password });
      return res.status(400).json({ Error: "Passwords do not match" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log("Generated password hash:", passwordHash);

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.error("User already exists with email:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user but set isActive to false until verified
    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHash,
      phone_number,
      country,
      role,
      isActive: false, // Ensure user is inactive until email verification
    });

    console.log("New user created:", newUser);

    // Generate verification token
    const verificationToken = jwt.sign({ userId: newUser._id }, jwtsecret, { expiresIn: "1h" });
    const verificationUrl = `http://localhost:2025/users/verify-email?token=${verificationToken}`;
    console.log("Generated verification token:", verificationToken);

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Verify your email address",
      html: `<p>Hello, Welcome to the WHEELHOUSE Family, Kindly click <a href="${verificationUrl}">here</a> to verify your email and activate your account. I am glad that you are reading this email.</p>`,
    };

    
    console.log("Mail options:", mailOptions);

    // Send the verification email
    try {
      await transport.sendMail(mailOptions);
      console.log("Verification email sent successfully to:", newUser.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({ message: "Error sending verification email." });
    }

    return res
      .status(201)
      .json({ msg: "Registration successful! Please check your email to verify your account." });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};




// Email verification handler
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token as string, jwtsecret) as { userId: string };

    // Find the user by ID and activate the account
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "Account already verified." });
    }

    user.isActive = true; // Activate the user account
    await user.save();

    // Redirect to login page after successful verification
    res.redirect("/http://127.0.0.1:5500/login.html"); // Make sure this path matches your frontend's login page
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};





export const loginUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password; // Fixed the variable name to 'password' from 'passWord'

    // Validate user
    const validateUser = LoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (validateUser.error) {
      return res
        .status(400)
        .json({ Error: validateUser.error.details[0].message });
    }

    // Verify if user exists
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    console.log("User found:", user);

    const { _id } = user;

    // Compare password
    const validUser = await bcrypt.compare(password, user.password);

    if (!validUser) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign({ _id }, jwtsecret, { expiresIn: "30d" });
    return res.status(200).json({
      msg: "Login Successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req: Request | any, res: Response) => {
  try {
    const { username } = req.body;

    // Validate request body
    console.log("Validating request body...");
    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.log("Validation error:", error.details);
      return res
        .status(400)
        .json({ Error: error.details.map((err: any) => err.message) });
    }

    // Find and update the user profile using the authenticated user's ID
    console.log("Updating user profile...");
    const profile = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        username,
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated", profile });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const uploadProof = async (req: Request | any, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Initialize a variable to store the picture URL
    let pictureUrl = "";

    // Check if a file was uploaded
    if (req.file) {
      try {
        // Upload the image to Cloudinary and retrieve its URL
        const result = await cloudinaryV2.uploader.upload(req.file.path);
        pictureUrl = result.secure_url; // Store the URL of the uploaded picture
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading image" });
      }
    } else {
      // If no file was uploaded, use the image URL from the request body if provided
      pictureUrl = req.body.image || "";
    }

    // If no picture URL is available, return an error
    if (!pictureUrl) {
      return res.status(400).json({ message: "No receipt uploaded" });
    }

    // Store the receipt URL from Cloudinary
    const receiptUrl = pictureUrl;

    // Update the order with the receipt URL and status
    order.receiptPath = receiptUrl;
    order.status = "pending"; // Flag the order as pending for admin review
    await order.save();

    const orderConfirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Proof of Payment Uploaded",
      text: `A new proof of payment has been uploaded for order ID: ${orderId}. Please review and approve the payment`,
    };

    // Send the order confirmation email
    await transport.sendMail(orderConfirmationMailOptions);

    // Respond with success message and updated order details
    res.status(200).json({ message: "Receipt uploaded successfully", order });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const { error, value } = orderHistorySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.params.userId;
    const { status, startDate, endDate } = value;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query: any = { user: userId };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    console.log("Query:", query);

    const orders = await OrderModel.find(query).sort({ createdAt: -1 });

    console.log("Orders found:", orders);

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      message: "Order history retrieved successfully",
      orders,
    });
  } catch (err) {
    console.error("Error retrieving order history:", err);
    res.status(500).json({
      message: "Error retrieving order history",
      error: (err as Error).message,
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

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { error, value } = cartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId, items } = value;

    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = new CartModel({ user: userId, items });
    } else {
      cart.items = [...cart.items, ...items];
    }

    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: (err as Error).message });
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

    // Find the user by ID
    const user = await UserModel.findById(userId).select("-password"); // Exclude password from the returned data
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

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
import {
  LoginSchema,
  RegisterSchema,
  updateProfileSchema,
  userIdSchema,
  wishlistSchema,
} from "../utils/utils";
import WishlistModel from "../models/whishlistModel";
import transport from "../emailConfig";
import { v2 as cloudinaryV2 } from "cloudinary";
import AdminRequest from "../types/UserRequest";

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
      return res.status(400).json({ Error: "Passwords do not match" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.error("User already exists with email:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    let pictureUrl = "";
    // Check if a file was uploaded
    if (req.file) {
      // Upload the image to Cloudinary and retrieve its URL
      const result = await cloudinaryV2.uploader.upload(req.file.path);
      pictureUrl = result.secure_url; // Store the URL of the uploaded picture
    }

    // Create new user but set isActive to false until verified
    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHash,
      phoneNumber,
      country,
      profilePhoto: pictureUrl,
      role,
      isActive: false, // Ensure user is inactive until email verification
    });

    console.log("New user created:", newUser);

    // Generate verification token
    const verificationToken = jwt.sign({ userId: newUser._id }, jwtsecret, {
      expiresIn: "1h",
    });
    const verificationUrl = `https://wheelhouse.onrender.com/users/verify-email?token=${verificationToken}`;

    const emailBackgroundUrl =
      "https://res.cloudinary.com/dsn2tjq5l/image/upload/v1729766502/lgyumyemlou8wgftaoew.jpg";
    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <body style="background-image:url('${emailBackgroundUrl}'); background-size:cover; background-position:center; width: 100%;
      background-repeat: no-repeat;">
          <div style="max-width:600px; margin:0 auto; padding:20px; line-height: 1.6; color:white; margin-top:2rem; text-align: justify">
            Welcome to Cribs&rides! 🎉<br><br>
    
            We’re thrilled to have you join our BILLIONAIRE'S community, where finding your dream home or the perfect ride is made easy and enjoyable. Whether you’re looking for a cozy crib or a LUXURY set of wheels, we’re here to make the journey smooth and exciting!<br><br>
    
            <strong>What You Can Expect:</strong><br>
            - Exclusive Listings: Browse a curated selection of homes and vehicles.<br>
            - Personalized Experience: Tailored recommendations to fit your lifestyle and preferences.<br>
            - Dedicated Support: Our team is always ready to assist with any questions or concerns.<br><br>
    
            Thank you for choosing Cribs&rides – we can’t wait to help you find your perfect match!<br><br>
    
            To get started, please verify your account by clicking the link below:<br><br>
    
            <a href="${verificationUrl}">Verify your account here</a>
          </div>
        </body>
        </html>
      `,
    };

    console.log("Mail options:", mailOptions);

    // Send the verification email
    try {
      await transport.sendMail(mailOptions);
      console.log("Verification email sent successfully to:", newUser.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res
        .status(500)
        .json({ message: "Error sending verification email." });
    }

    return res.status(201).json({
      msg: "Registration successful! Please check your email to verify your account.",
    });
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
    const decoded = jwt.verify(token as string, jwtsecret) as {
      userId: string;
    };

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
    res.redirect("  https://wheelhouse.onrender.com/users/login"); // Make sure this path matches your frontend's login page
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

export const updateUserProfile = async (req: AdminRequest, res: Response) => {
  try {
    // Destructure required fields from the request body
    const { username, password, confirm_password } = req.body;

    // Validate request body
    console.log("Validating request body...");
    const { error } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
    });
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

    let passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      console.log("Salt:", salt);
      console.log("Password:", password);
      passwordHash = await bcrypt.hash(password, salt);
    }

    let pictureUrl = "";
    // Check if a file was uploaded
    if (req.file) {
      // Upload the image to Cloudinary and retrieve its URL
      const result = await cloudinaryV2.uploader.upload(req.file.path);
      pictureUrl = result.secure_url; // Store the URL of the uploaded picture
    }

    const updateData: any = { username }; // Prepare update data

    // Only include passwordHash if a new password is being set
    if (passwordHash) {
      updateData.password = passwordHash;
    }

    if (pictureUrl) {
      updateData.profilePhoto = pictureUrl;
    }

    // Update user profile in the database
    const profile = await UserModel.findByIdAndUpdate(
      req.user?._id, // Accessing user ID from req.user
      updateData,
      { new: true }
    );

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

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  adminLoginSchema,
  adminRegistrationSchema,
  createAdminSchema,
  passwordSchema,
} from "../utils/utils";
import UserModel from "../models/UserModel";

const jwtsecret = process.env.JWT_SECRET as string;

export const adminRegister = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const { error, value } = adminRegistrationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = value;




    // Check if the username already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new UserModel({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error in admin registration:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const { error, value } = adminLoginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = value;

    const user = await UserModel.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin rights required." });
    }
    // In your login function
    const token = jwt.sign({ _id: user._id, role: user.role }, jwtsecret, {
      expiresIn: "30d",
    });

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

// List all registered users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find(
      {},
      "name email createdAt isActive role"
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Update user information
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Deactivate/Reactivate user account
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({
      message: `User ${
        user.isActive ? "reactivated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Error toggling user status" });
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Validate the password using Joi schema
    const { error } = passwordSchema.validate({ newPassword });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Create a new admin user
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    // Validate the request body against the schema
    const { error, value } = createAdminSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = value; // Use validated values

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res
      .status(201)
      .json({ message: "Admin user created successfully", newAdmin });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Error creating admin user" });
  }
};

// Assign admin role to an existing user
export const assignAdminRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = "admin";
    await user.save();
    res.status(200).json({ message: "Admin role assigned successfully", user });
  } catch (error) {
    console.error("Error assigning admin role:", error);
    res.status(500).json({ message: "Error assigning admin role" });
  }
};

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  adminLoginSchema,
  adminRegistrationSchema,
  createAdminSchema,
  emailSchema,
  passwordSchema,
  userIdSchema,
} from "../utils/utils";
import UserModel from "../models/UserModel";
import transport from "../emailConfig";

const jwtSecret = process.env.JWT_SECRET as string;

// Admin registration
export const adminRegister = async (req: Request, res: Response) => {
  try {
    const { error, value } = adminRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, phoneNumber, country } = value;

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new UserModel({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      country,
      role: "admin",
    });

    await newAdmin.save();

    return res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error in admin registration:", error);
    return res.status(500).json({ message: "Error creating admin" });
  }
};

// Admin login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = value;
    const user = await UserModel.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin rights required." });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "30d",
    });

    return res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Error in admin login:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};

// Get all users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await UserModel.find({}, "name email createdAt isActive role")
      .skip(skip)
      .limit(Number(limit));
    const totalUsers = await UserModel.countDocuments({});

    return res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      currentPage: Number(page),
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users" });
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

    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user" });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save({ validateModifiedOnly: true });

    return res.status(200).json({
      message: `User ${user.isActive ? "reactivated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({ message: "Error toggling user status" });
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

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

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Error resetting password" });
  }
};

// Create a new admin user
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = createAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = value;

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

    return res.status(201).json({ message: "Admin user created successfully", newAdmin });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ message: "Error creating admin user" });
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

    return res.status(200).json({ message: "Admin role assigned successfully", user });
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return res.status(500).json({ message: "Error assigning admin role" });
  }
};

// Get admin profile by ID
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { adminId } = value;

    const admin = await UserModel.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin profile retrieved successfully",
      admin,
    });
  } catch (error) {
    console.error("Error retrieving admin profile:", error);
    return res.status(500).json({
      message: "Error retrieving admin profile",
      error: (error as Error).message,
    });
  }
};

// Send email to all users
export const sendEmailToUsers = async (req: Request, res: Response): Promise<void> => {
  const { subject, messageContent } = req.body;
  const { error } = emailSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const users = await UserModel.find();
    if (users.length === 0) {
      res.status(404).json({ message: "No registered users found" });
      return;
    }

    const backgroundUrl =
      "https://res.cloudinary.com/dsn2tjq5l/image/upload/v1729766502/lgyumyemlou8wgftaoew.jpg";

    await Promise.all(
      users.map(async (user) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject,
          html: `
            <html>
              <body style="background-image: url('${backgroundUrl}'); background-size: cover; font-family: Arial, sans-serif; padding: 20px; color: white;">
                <h1>Hello, ${user.username}!</h1>
                <p style="font-size: 16px;">${messageContent}</p>
                <p>Best regards,<br><strong>Cribs&rides</strong></p>
              </body>
            </html>
          `,
        };
        await transport.sendMail(mailOptions);
      })
    );

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Error sending verification email." });
  }
};

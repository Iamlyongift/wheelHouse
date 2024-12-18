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

const jwtsecret = process.env.JWT_SECRET as string;

export const adminRegister = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const { error, value } = adminRegistrationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, phoneNumber, country } = value;

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
      phoneNumber,
      country,
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
    const { page = 1, limit = 10 } = req.query; // Set default values if not provided

    // Calculate the number of documents to skip
    const skip = (Number(page) - 1) * Number(limit);

    // Find users with pagination and total count
    const users = await UserModel.find({}, "name email createdAt isActive role")
      .skip(skip)
      .limit(Number(limit));

    // Get total user count for pagination
    const totalUsers = await UserModel.countDocuments({});

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      currentPage: Number(page),
      totalUsers,
    });
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

    // Toggle isActive
    user.isActive = !user.isActive;

    // Save the user without needing to validate other fields
    await user.save({ validateModifiedOnly: true });

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

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { adminId } = value;

    // Find the admin by ID
    const admin = await UserModel.findById(adminId).select("-password"); // Exclude password from the returned data
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin profile retrieved successfully",
      admin,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving admin profile",
      error: (err as Error).message,
    });
  }
};

export const sendEmailToUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subject, messageContent } = req.body;
  const { error } = emailSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return; // Return immediately to avoid further execution
  }

  try {
    // Fetch all registered users from the database
    const users = await UserModel.find();

    if (users.length === 0) {
      res.status(404).json({ message: "No registered users found" });
      return;
    }

    const emailBackgroundUrl =
      "https://res.cloudinary.com/dsn2tjq5l/image/upload/v1729766502/lgyumyemlou8wgftaoew.jpg";
    // Send emails to all users concurrently
    await Promise.all(
      users.map(async (user) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: subject,
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <style>
              @media only screen and (max-width: 600px) {
                .content {
                  margin: 1rem auto; /* Less margin on mobile */
                  padding: 5px; /* Less padding on mobile */
                }
                h1 {
                  font-size: 24px; /* Adjust heading size for mobile */
                }
                p {
                  font-size: 14px; /* Adjust paragraph size for mobile */
                }
              }
            </style>
          </head>
          <body style="background-image:url('${emailBackgroundUrl}'); background-size: cover; background-position: center; margin: 0; padding: 0; font-family: Arial, sans-serif; width: 100%; background-repeat: no-repeat;">
            <div style="background-color: transparent; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; color: white;">
              <h1 style="color: #fff; text-align: left;">Hello, ${user.username}!</h1>
              <div style="background-color: transparent; padding: 15px; border-radius: 8px;">
                <p style="font-size: 16px; line-height: 1.5; text-align: justify; color: #f4f4f4;">${messageContent}</p>
              </div>
              <p style="text-align: left; margin-top: 20px; font-size: 14px; color: #ddd;">Best regards,<br><strong>Cribs&rides</strong></p>
            </div>
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

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailToUsers = exports.getAdminProfile = exports.assignAdminRole = exports.createAdminUser = exports.resetUserPassword = exports.toggleUserStatus = exports.updateUser = exports.getAllUsers = exports.adminLogin = exports.adminRegister = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils/utils");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const jwtsecret = process.env.JWT_SECRET;
const adminRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.adminRegistrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, email, password, phoneNumber, country } = value;
        const existingUser = yield UserModel_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newAdmin = new UserModel_1.default({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            country,
            role: "admin",
        });
        yield newAdmin.save();
        res.status(201).json({ message: "Admin created successfully" });
    }
    catch (error) {
        console.error("Error in admin registration:", error);
        res.status(500).json({ message: "Error creating admin" });
    }
});
exports.adminRegister = adminRegister;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.adminLoginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, password } = value;
        const user = yield UserModel_1.default.findOne({ username });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        if (user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Access denied. Admin rights required." });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, role: user.role }, jwtsecret, {
            expiresIn: "30d",
        });
        res.json({ token, role: user.role });
    }
    catch (error) {
        console.error("Error in admin login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});
exports.adminLogin = adminLogin;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const users = yield UserModel_1.default.find({}, "name email createdAt isActive role")
            .skip(skip)
            .limit(Number(limit));
        const totalUsers = yield UserModel_1.default.countDocuments({});
        res.status(200).json({
            users,
            totalPages: Math.ceil(totalUsers / Number(limit)),
            currentPage: Number(page),
            totalUsers,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, req.body, {
            new: true,
        });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
    }
});
exports.updateUser = updateUser;
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield UserModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isActive = !user.isActive;
        yield user.save({ validateModifiedOnly: true });
        res.status(200).json({
            message: `User ${user.isActive ? "reactivated" : "deactivated"} successfully`,
            user,
        });
    }
    catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ message: "Error toggling user status" });
    }
});
exports.toggleUserStatus = toggleUserStatus;
const resetUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        const { error } = utils_1.passwordSchema.validate({ newPassword });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const user = yield UserModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
});
exports.resetUserPassword = resetUserPassword;
const createAdminUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.createAdminSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, email, password } = value;
        const existingUser = yield UserModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newAdmin = yield UserModel_1.default.create({
            username,
            email,
            password: hashedPassword,
            role: "admin",
        });
        res
            .status(201)
            .json({ message: "Admin user created successfully", newAdmin });
    }
    catch (error) {
        console.error("Error creating admin user:", error);
        res.status(500).json({ message: "Error creating admin user" });
    }
});
exports.createAdminUser = createAdminUser;
const assignAdminRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield UserModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.role = "admin";
        yield user.save();
        res.status(200).json({ message: "Admin role assigned successfully", user });
    }
    catch (error) {
        console.error("Error assigning admin role:", error);
        res.status(500).json({ message: "Error assigning admin role" });
    }
});
exports.assignAdminRole = assignAdminRole;
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { adminId } = value;
        const admin = yield UserModel_1.default.findById(adminId).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({
            message: "Admin profile retrieved successfully",
            admin,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error retrieving admin profile",
            error: err.message,
        });
    }
});
exports.getAdminProfile = getAdminProfile;
const sendEmailToUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, messageContent } = req.body;
    const { error } = utils_1.emailSchema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    try {
        const users = yield UserModel_1.default.find();
        if (users.length === 0) {
            res.status(404).json({ message: "No registered users found" });
            return;
        }
        const emailBackgroundUrl = "https://res.cloudinary.com/dsn2tjq5l/image/upload/v1729766502/lgyumyemlou8wgftaoew.jpg";
        yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: subject,
                html: `
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-image:url('${emailBackgroundUrl}');  background-size: contain;
      background-position: center;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      width: 100%;
      background-repeat: no-repeat;">
              <div style="background-color:transparent; width:100%; height:100%;  margin: 14rem auto; padding:10px; border-radius:8px; color:white;">
                <h1 style="color: #fff;
          text-align: left;
          padding-inline: 1rem;">Hello, ${user.username}!</h1>
                <div style="background-color:transparent; padding:15px; border-radius:8px;">
                  <p style="font-size:16px; line-height:1.5; text-align:justify; color:#f4f4f4;">${messageContent}</p>
                </div>
                <p style=" text-align: left;  
          padding-inline: 1rem;
          margin-top: 20px;
          font-size: 14px;
          color: #ddd;">Best regards,<br><strong>Cribs&rides</strong></p>
              </div>
            </body>
            </html>
          `,
            };
            yield emailConfig_1.default.sendMail(mailOptions);
        })));
        res.status(200).json({ message: "Emails sent successfully" });
    }
    catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ message: "Error sending verification email." });
    }
});
exports.sendEmailToUsers = sendEmailToUsers;

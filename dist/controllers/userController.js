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
exports.getProfile = exports.addToCart = exports.addToWishlist = exports.getOrderHistory = exports.uploadProof = exports.updateUserProfile = exports.loginUser = exports.verifyEmail = exports.RegisterUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const cloudinary_1 = require("cloudinary");
const utils_1 = require("../utils/utils");
const OrderModel_1 = __importDefault(require("../models/OrderModel"));
const whishlistModel_1 = __importDefault(require("../models/whishlistModel"));
const CartModel_1 = __importDefault(require("../models/CartModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const jwtsecret = process.env.JWT_SECRET;
const RegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, confirm_password, phone_number, country, role, } = req.body;
        console.log("Received registration data:", req.body);
        const { error } = utils_1.RegisterSchema.validate(req.body, { abortEarly: false });
        if (error) {
            console.error("Validation error:", error.details);
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        if (password !== confirm_password) {
            console.error("Password mismatch:", { password, confirm_password });
            return res.status(400).json({ Error: "Passwords do not match" });
        }
        const salt = yield bcryptjs_1.default.genSalt(12);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        console.log("Generated password hash:", passwordHash);
        const existingUser = yield UserModel_1.default.findOne({ email });
        if (existingUser) {
            console.error("User already exists with email:", email);
            return res.status(400).json({ error: "User already exists" });
        }
        const newUser = yield UserModel_1.default.create({
            username,
            email,
            password: passwordHash,
            phone_number,
            country,
            role,
            isActive: false,
        });
        console.log("New user created:", newUser);
        const verificationToken = jsonwebtoken_1.default.sign({ userId: newUser._id }, jwtsecret, { expiresIn: "1h" });
        const verificationUrl = `http://localhost:2025/users/verify-email?token=${verificationToken}`;
        console.log("Generated verification token:", verificationToken);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: "Verify your email address",
            html: `<p>Hello, Welcome to the WHEELHOUSE Family, Kindly click <a href="${verificationUrl}">here</a> to verify your email and activate your account. I am glad that you are reading this email.</p>`,
        };
        console.log("Mail options:", mailOptions);
        try {
            yield emailConfig_1.default.sendMail(mailOptions);
            console.log("Verification email sent successfully to:", newUser.email);
        }
        catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return res.status(500).json({ message: "Error sending verification email." });
        }
        return res
            .status(201)
            .json({ msg: "Registration successful! Please check your email to verify your account." });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.RegisterUser = RegisterUser;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtsecret);
        const user = yield UserModel_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.isActive) {
            return res.status(400).json({ message: "Account already verified." });
        }
        user.isActive = true;
        yield user.save();
        res.redirect("/http://127.0.0.1:5500/login.html");
    }
    catch (error) {
        console.error("Verification error:", error);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});
exports.verifyEmail = verifyEmail;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const validateUser = utils_1.LoginSchema.validate(req.body, {
            abortEarly: false,
        });
        if (validateUser.error) {
            return res
                .status(400)
                .json({ Error: validateUser.error.details[0].message });
        }
        const user = yield UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        console.log("User found:", user);
        const { _id } = user;
        const validUser = yield bcryptjs_1.default.compare(password, user.password);
        if (!validUser) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ _id }, jwtsecret, { expiresIn: "30d" });
        return res.status(200).json({
            msg: "Login Successful",
            user,
            token,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        console.log("Validating request body...");
        const { error, value } = utils_1.updateProfileSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            console.log("Validation error:", error.details);
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        console.log("Updating user profile...");
        const profile = yield UserModel_1.default.findByIdAndUpdate(req.user._id, {
            username,
        }, { new: true });
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated", profile });
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
exports.updateUserProfile = updateUserProfile;
const uploadProof = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield OrderModel_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        let pictureUrl = "";
        if (req.file) {
            try {
                const result = yield cloudinary_1.v2.uploader.upload(req.file.path);
                pictureUrl = result.secure_url;
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({ message: "Error uploading image" });
            }
        }
        else {
            pictureUrl = req.body.image || "";
        }
        if (!pictureUrl) {
            return res.status(400).json({ message: "No receipt uploaded" });
        }
        const receiptUrl = pictureUrl;
        order.receiptPath = receiptUrl;
        order.status = "pending";
        yield order.save();
        const orderConfirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "New Proof of Payment Uploaded",
            text: `A new proof of payment has been uploaded for order ID: ${orderId}. Please review and approve the payment`,
        };
        yield emailConfig_1.default.sendMail(orderConfirmationMailOptions);
        res.status(200).json({ message: "Receipt uploaded successfully", order });
    }
    catch (error) {
        console.error("Error creating payment:", error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});
exports.uploadProof = uploadProof;
const getOrderHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.orderHistorySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const userId = req.params.userId;
        const { status, startDate, endDate } = value;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const query = { user: userId };
        if (status) {
            query.status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        console.log("Query:", query);
        const orders = yield OrderModel_1.default.find(query).sort({ createdAt: -1 });
        console.log("Orders found:", orders);
        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }
        res.status(200).json({
            message: "Order history retrieved successfully",
            orders,
        });
    }
    catch (err) {
        console.error("Error retrieving order history:", err);
        res.status(500).json({
            message: "Error retrieving order history",
            error: err.message,
        });
    }
});
exports.getOrderHistory = getOrderHistory;
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.wishlistSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { userId, items } = value;
        let wishlist = yield whishlistModel_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new whishlistModel_1.default({ user: userId, items });
        }
        else {
            wishlist.items = [...wishlist.items, ...items];
        }
        yield wishlist.save();
        res.status(200).json({
            message: "Wishlist updated successfully",
            wishlist,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error updating wishlist",
            error: err.message,
        });
    }
});
exports.addToWishlist = addToWishlist;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.cartSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { userId, items } = value;
        let cart = yield CartModel_1.default.findOne({ user: userId });
        if (!cart) {
            cart = new CartModel_1.default({ user: userId, items });
        }
        else {
            cart.items = [...cart.items, ...items];
        }
        yield cart.save();
        res.status(200).json({
            message: "Cart updated successfully",
            cart,
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Error updating cart", error: err.message });
    }
});
exports.addToCart = addToCart;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { userId } = value;
        const user = yield UserModel_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User profile retrieved successfully",
            user,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error retrieving user profile",
            error: err.message,
        });
    }
});
exports.getProfile = getProfile;

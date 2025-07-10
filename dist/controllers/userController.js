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
exports.getProfile = exports.addToWishlist = exports.updateUserProfile = exports.loginUser = exports.verifyEmail = exports.RegisterUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const whishlistModel_1 = __importDefault(require("../models/whishlistModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const utils_1 = require("../utils/utils");
const jwtsecret = process.env.JWT_SECRET;
const RegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, confirm_password, phoneNumber, country, role, } = req.body;
        console.log("📥 Incoming registration request:", req.body);
        console.log("📸 Uploaded file info:", req.file);
        const { error } = utils_1.RegisterSchema.validate(req.body, { abortEarly: false });
        if (error) {
            console.error("❌ Validation failed:", error.details);
            return res.status(400).json({
                error: error.details.map((err) => err.message),
            });
        }
        if (password !== confirm_password) {
            console.warn("❌ Passwords do not match");
            return res.status(400).json({ error: "Passwords do not match" });
        }
        const existingUser = yield UserModel_1.default.findOne({ email });
        if (existingUser) {
            console.warn("⚠️ User already exists with email:", email);
            return res.status(400).json({ error: "User already exists" });
        }
        const salt = yield bcryptjs_1.default.genSalt(12);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        let pictureUrl = "";
        if (req.file) {
            try {
                const uploadResult = yield cloudinary_1.v2.uploader.upload(req.file.path);
                pictureUrl = uploadResult.secure_url;
                console.log("✅ Image uploaded to Cloudinary:", pictureUrl);
            }
            catch (uploadErr) {
                console.error("❌ Cloudinary upload failed:", uploadErr);
                return res.status(500).json({ error: "Image upload failed" });
            }
        }
        const newUser = yield UserModel_1.default.create({
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
        const verificationToken = jsonwebtoken_1.default.sign({ userId: newUser._id }, jwtsecret, { expiresIn: "1h" });
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
            yield emailConfig_1.default.sendMail(mailOptions);
            console.log("✅ Verification email sent.");
        }
        catch (emailErr) {
            console.error("❌ Email sending failed:", emailErr);
            return res.status(500).json({ error: "Email sending failed" });
        }
        return res.status(201).json({
            msg: "Registration successful! Please check your email to verify your account.",
        });
    }
    catch (error) {
        console.error("❌ Registration error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.RegisterUser = RegisterUser;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtsecret);
        const user = yield UserModel_1.default.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.isActive) {
            return res.status(400).json({ message: "Account already verified." });
        }
        user.isActive = true;
        yield user.save();
        res.redirect("https://wheelhouse.onrender.com/users/login");
    }
    catch (error) {
        console.error("Verification error:", error);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});
exports.verifyEmail = verifyEmail;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const validateUser = utils_1.LoginSchema.validate(req.body, { abortEarly: false });
        if (validateUser.error) {
            return res.status(400).json({ Error: validateUser.error.details[0].message });
        }
        const user = yield UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        console.log("User found:", user);
        const validUser = yield bcryptjs_1.default.compare(password, user.password);
        if (!validUser) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, jwtsecret, { expiresIn: "30d" });
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
    var _a;
    try {
        const { username, password, confirm_password } = req.body;
        console.log("Validating request body...");
        const { error } = utils_1.updateProfileSchema.validate(req.body, { abortEarly: false });
        if (error) {
            console.log("Validation error:", error.details);
            return res.status(400).json({
                Error: error.details.map((err) => err.message),
            });
        }
        if (password && password !== confirm_password) {
            return res.status(400).json({ Error: "Passwords do not match" });
        }
        let passwordHash;
        if (password) {
            const salt = yield bcryptjs_1.default.genSalt(12);
            console.log("Salt:", salt);
            console.log("Password:", password);
            passwordHash = yield bcryptjs_1.default.hash(password, salt);
        }
        let pictureUrl = "";
        if (req.file) {
            const result = yield cloudinary_1.v2.uploader.upload(req.file.path);
            pictureUrl = result.secure_url;
        }
        const updateData = { username };
        if (passwordHash)
            updateData.password = passwordHash;
        if (pictureUrl)
            updateData.profilePhoto = pictureUrl;
        const profile = yield UserModel_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, updateData, { new: true });
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated", profile });
    }
    catch (error) {
        res.status(500).json({
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
});
exports.updateUserProfile = updateUserProfile;
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

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
const UserModel_1 = __importDefault(require("../models/UserModel"));
const utils_1 = require("../utils/utils");
const whishlistModel_1 = __importDefault(require("../models/whishlistModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const cloudinary_1 = require("cloudinary");
const jwtsecret = process.env.JWT_SECRET;
const RegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, confirm_password, phoneNumber, country, role, } = req.body;
        const { error } = utils_1.RegisterSchema.validate(req.body, { abortEarly: false });
        if (error) {
            console.error("Validation error:", error.details);
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ Error: "Passwords do not match" });
        }
        const salt = yield bcryptjs_1.default.genSalt(12);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const existingUser = yield UserModel_1.default.findOne({ email });
        if (existingUser) {
            console.error("User already exists with email:", email);
            return res.status(400).json({ error: "User already exists" });
        }
        let pictureUrl = "";
        if (req.file) {
            const result = yield cloudinary_1.v2.uploader.upload(req.file.path);
            pictureUrl = result.secure_url;
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
        console.log("New user created:", newUser);
        const verificationToken = jsonwebtoken_1.default.sign({ userId: newUser._id }, jwtsecret, {
            expiresIn: "1h",
        });
        const verificationUrl = `http://localhost:2025/users/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: "Verify your email address",
            html: `
        Welcome to Cribs&rides! 🎉<br><br>
    
        We’re thrilled to have you join our BILLIONAIRE'S community, where finding your dream home or the perfect ride is made easy and enjoyable. Whether you’re looking for a cozy crib or a LUXURY set of wheels, we’re here to make the journey smooth and exciting!<br><br>
    
        <strong>What You Can Expect:</strong><br>
        - Exclusive Listings: Browse a curated selection of homes and vehicles.<br>
        - Personalized Experience: Tailored recommendations to fit your lifestyle and preferences.<br>
        - Dedicated Support: Our team is always ready to assist with any questions or concerns.<br><br>
    
        Thank you for choosing Cribs&rides – we can’t wait to help you find your perfect match!<br><br>
    
        To get started, please verify your account by clicking the link below:<br><br>
    
        <a href="${verificationUrl}">Verify your account here</a>
      `,
        };
        console.log("Mail options:", mailOptions);
        try {
            yield emailConfig_1.default.sendMail(mailOptions);
            console.log("Verification email sent successfully to:", newUser.email);
        }
        catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return res
                .status(500)
                .json({ message: "Error sending verification email." });
        }
        return res.status(201).json({
            msg: "Registration successful! Please check your email to verify your account.",
        });
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
        res.redirect("http://localhost:5173");
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
        const { username, password, confirm_password } = req.body;
        console.log("Validating request body...");
        const { error } = utils_1.updateProfileSchema.validate(req.body, {
            abortEarly: false,
        });
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
        if (passwordHash) {
            updateData.password = passwordHash;
        }
        if (pictureUrl) {
            updateData.profilePhoto = pictureUrl;
        }
        const profile = yield UserModel_1.default.findByIdAndUpdate(req.user._id, updateData, { new: true });
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated", profile });
    }
    catch (error) {
        console.error("Error:", error);
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

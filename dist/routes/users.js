"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const TestimonialController_1 = require("../controllers/TestimonialController");
const Auth_1 = require("../middleware/Auth");
const UploadImages_1 = require("../library/helpers/UploadImages");
const ContactController_1 = require("../controllers/ContactController");
const router = express_1.default.Router();
router.post("/register", UploadImages_1.upload.single("profilePhoto"), userController_1.RegisterUser);
router.get("/verify-email", userController_1.verifyEmail);
router.post("/login", userController_1.loginUser);
router.get("/verify", Auth_1.auth, (req, res) => {
    res.status(200).json({
        message: "User is authenticated",
        user: req.user,
    });
});
router.get("/testimonials", TestimonialController_1.getTestimonials);
router.use(Auth_1.auth);
router.post("/create-testimonials", TestimonialController_1.createTestimonial);
router.put("/update_profile", userController_1.updateUserProfile);
router.get("/profile/:userId", userController_1.getProfile);
router.get("/wishlist", userController_1.addToWishlist);
router.post("/contact", ContactController_1.submitContactForm);
exports.default = router;

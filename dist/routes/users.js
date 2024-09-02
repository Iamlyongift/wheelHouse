"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const Auth_1 = require("../middleware/Auth");
const payment_1 = require("../controllers/payment");
const UploadImages_1 = require("../library/helpers/UploadImages");
const router = express_1.default.Router();
router.post("/register", userController_1.RegisterUser);
router.get("/verify-email", userController_1.verifyEmail);
router.post("/login", userController_1.loginUser);
router.get("/verify", Auth_1.auth, (req, res) => {
    res.status(200).json({
        message: "User is authenticated",
        user: req.user,
    });
});
router.use(Auth_1.auth);
router.put("/update_profile", userController_1.updateUserProfile);
router.get("/profile/:userId", userController_1.getProfile);
router.get("/:userId/orders", userController_1.getOrderHistory);
router.get("/orders/:orderId/bank-details", payment_1.bankDetail);
router.post("/orders/:orderId/upload-receipt", UploadImages_1.upload.single("receipt"));
router.put("/admin/orders/:orderId/verify-payment", payment_1.verifyPayment);
router.get("/wishlist", userController_1.addToWishlist);
router.get("/cart", userController_1.addToCart);
exports.default = router;

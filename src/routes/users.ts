import express from "express";
import {
  addToCart,
  addToWishlist,
  getOrderHistory,
  getProfile,
  loginUser,
  RegisterUser,
  updateUserProfile,
  verifyEmail,
} from "../controllers/userController";
import { auth } from "../middleware/Auth"; // Ensure the path is correct
import { bankDetail, verifyPayment } from "../controllers/payment";
import { upload } from "../library/helpers/UploadImages";

const router = express.Router();

// Public routes
router.post("/register", RegisterUser);
router.get("/verify-email", verifyEmail); 
router.post("/login", loginUser);

// Add the verify endpoint to check if the user is authenticated
router.get("/verify", auth, (req, res) => {
  // The auth middleware verifies the token and sets the user in req.user
  res.status(200).json({
    message: "User is authenticated",
    user: req.user, // Includes user details from the verified token
  });
});

// Protected routes - Require authentication
router.use(auth);

// User profile and updates
router.put("/update_profile", updateUserProfile);
router.get("/profile/:userId", getProfile);

// Orders and payment
router.get("/:userId/orders", getOrderHistory);
router.get("/orders/:orderId/bank-details", bankDetail);
router.post("/orders/:orderId/upload-receipt", upload.single("receipt"));
router.put("/admin/orders/:orderId/verify-payment", verifyPayment);

// Wishlist and cart
router.get("/ ", addToWishlist);
router.get("/cart", addToCart);

export default router;

import express from "express";
import {
  addToWishlist,
  getProfile,
  loginUser,
  RegisterUser,
  updateUserProfile,
  verifyEmail,
} from "../controllers/userController";
import {
  createTestimonial,
  getTestimonials,
} from "../controllers/TestimonialController";
import { auth } from "../middleware/Auth"; // Ensure the path is correct
import { upload } from "../library/helpers/UploadImages";

const router = express.Router();

// Public routes
router.post("/register",  upload.single('profilePhoto'), RegisterUser);
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
router.get("/testimonials", getTestimonials);

router.use(auth);
router.post("/create-testimonials", createTestimonial);
// User profile and updates
router.put("/update_profile", updateUserProfile);
router.get("/profile/:userId", getProfile);
// Wishlist and cart
router.get("/wishlist", addToWishlist);

export default router;

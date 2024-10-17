import express, { Response } from "express";
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
import { auth } from "../middleware/Auth";
import { upload } from "../library/helpers/UploadImages";
import { submitContactForm } from "../controllers/connectController";
import AdminRequest from "../types/UserRequest";

const router = express.Router();

// Public routes
router.post("/register", upload.single("profilePhoto"), RegisterUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);

router.get("/verify", auth, (req: AdminRequest, res: Response) => {
  if (req.user) {
    res.status(200).json({
      message: "User is authenticated",
      user: {
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
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
// contact
router.post("/contact", submitContactForm);

export default router;

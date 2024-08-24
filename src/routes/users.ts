import express from "express";
import {
  addToCart,
  addToWishlist,
  getOrderHistory,
  getProfile,
  loginUser,
  RegisterUser,
  updateUserProfile,
} from "../controllers/userController";
import { auth } from "../middleware/Auth";
import { bankDetail, verifyPayment } from "../controllers/payment";
import { upload } from "../library/helpers/UploadImages";
const router = express.Router();

/* GET users listing. */

router.post("/register", RegisterUser);
router.post("/login", loginUser);

router.use(auth);

router.put("/update_profile", updateUserProfile);
router.get("/orders/:orderId/bank-details", bankDetail);
router.post("/orders/:orderId/upload-receipt", upload.single("receipt"));
router.put("/admin/orders/:orderId/verify-payment", verifyPayment);

router.get("/:userId/orders", getOrderHistory);
router.get("/wishlist", addToWishlist);
router.get("/cart", addToCart);
router.get("/profile/:userId", getProfile);

export default router;

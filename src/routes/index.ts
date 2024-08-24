import express from "express";
import { auth, requireAdmin } from "../middleware/Auth";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController";
import { upload } from "../library/helpers/UploadImages";

const router = express.Router();

/* GET home page. */
router.use(auth, requireAdmin);
router.post("/createproduct", upload.array("images", 5), createProduct);
router.put("/updateProduct/:id", updateProduct);
router.get("/getAllProduct", getAllProducts);
router.get("/getSingleProduct/:id", getSingleProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;

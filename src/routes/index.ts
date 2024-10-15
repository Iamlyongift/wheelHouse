import express from "express";
import { auth, requireAdmin } from "../middleware/Auth";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getCars,
  getHouses,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController";
import { upload } from "../library/helpers/UploadImages";
import { getAllMessages } from "../controllers/adminCategoryController";

const router = express.Router();


router.get("/houses", getHouses);
router.get("/cars", getCars);
router.get("/getSingleProduct/:id", getSingleProduct);
/* GET home page. */
router.use(auth, requireAdmin);
router.post("/createproduct", upload.array("images", 5), createProduct);
router.put("/updateProduct/:id", updateProduct);
router.get("/getAllProduct", getAllProducts);

router.delete("/deleteProduct/:id", deleteProduct);
// Route for getting all houses


// messages
router.get("/contact/messages", getAllMessages);

export default router;

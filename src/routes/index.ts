import express, { Request, Response } from "express";
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
import ProductModel from "../models/ProductModel";


const router = express.Router();
const app = express();

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

app.get("/product/getAllProduct", async (req: Request, res: Response) => {
  try {
    const productCount = await ProductModel.countDocuments(); // Assuming Product is your product model
    res.json({ count: productCount });
  } catch (error) {
    res.status(500).json({ error: "Error fetching product count" });
  }
});



// messages
router.get("/contact/messages", getAllMessages);

export default router;

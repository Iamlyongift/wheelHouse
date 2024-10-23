import express, { Request, Response } from "express";

import {
  adminLogin,
  adminRegister,
  getAdminProfile,
  sendEmailToUsers,
  toggleUserStatus,
} from "../controllers/adminController";
import { auth, requireAdmin } from "../middleware/Auth";
import ContactModel from "../models/ContactModel";
import UserModel from "../models/UserModel";
import CategoryModel from "../models/CategoryModel";
const router = express.Router();

//adminLogs
router.post("/adminReg", adminRegister);
router.post("/adminLogin", adminLogin);

const app = express();
router.use(auth, requireAdmin);
//user/admin management
import {
  getAllUsers,
  updateUser,
  resetUserPassword,
  createAdminUser,
  assignAdminRole,
} from "../controllers/adminController";

router.get("/users", getAllUsers);
router.put("/users/:userId", updateUser);
router.patch("/users/:userId/toggle-status", toggleUserStatus);
router.patch("/users/:userId/reset-password", resetUserPassword);
router.post("/creatAdmin", createAdminUser);
router.patch("/users/:userId/assign-role", assignAdminRole);

//Category
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategoriesByType,
} from "../controllers/adminCategoryController";
import { upload } from "../library/helpers/UploadImages";

router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.get("/categories/:type", getCategoriesByType);
router.get("/profile/:adminId", getAdminProfile);
router.delete("/categories/:categoryId", deleteCategory);
router.get("/getcategories", getCategory);
router.post("/send-email", upload.single("image"), sendEmailToUsers);

// counts
app.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const userCount = await UserModel.countDocuments(); // Assuming User is your user model
    res.json({ count: userCount });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user count" });
  }
});

app.get("/admin/getcategories", async (req: Request, res: Response) => {
  try {
    const categoryCount = await CategoryModel.countDocuments(); // Assuming Category is your category model
    res.json({ count: categoryCount });
  } catch (error) {
    res.status(500).json({ error: "Error fetching category count" });
  }
});

app.get("/feedback/count", async (req: Request, res: Response) => {
  try {
    const feedbackCount = await ContactModel.countDocuments(); // Ensure ContactModel is correct
    res.json({ count: feedbackCount });
  } catch (error) {
    res.status(500).json({ error: "Error fetching feedback count" });
  }
});

export default router;

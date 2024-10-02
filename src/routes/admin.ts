import express from "express";
import { adminLogin, adminRegister } from "../controllers/adminController";
import { auth, requireAdmin } from "../middleware/Auth";

const router = express.Router();

//adminLogs
router.post("/adminReg", adminRegister);
router.post("/adminLogin", adminLogin);

router.use(auth, requireAdmin);
//payment

router.use(auth, requireAdmin);

//user/admin management
import {
  getAllUsers,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  createAdminUser,
  assignAdminRole,
} from "../controllers/adminController";

router.get("/users", getAllUsers);
router.put("/users/:userId", updateUser);
router.patch("/users/:userId/status", toggleUserStatus);
router.patch("/users/:userId/reset-password", resetUserPassword);
router.post("/creatAdmin", createAdminUser);
router.patch("/users/:userId/assign-role", assignAdminRole);

//Category
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} from "../controllers/adminCategoryController";

router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);
router.get("/getcategories", getCategory);

//inventory route

export default router;

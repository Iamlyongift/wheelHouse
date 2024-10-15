import express from "express";
import {
  adminLogin,
  adminRegister,
  getAdminProfile,
  toggleUserStatus,
} from "../controllers/adminController";
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


router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.get('/categories/:type', getCategoriesByType);
router.get("/profile/:adminId", getAdminProfile);
router.delete("/categories/:categoryId", deleteCategory);
router.get("/getcategories", getCategory);




export default router;



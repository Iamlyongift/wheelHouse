import express from "express";
import { adminLogin, adminRegister } from "../controllers/adminController";
import { auth, requireAdmin } from "../middleware/Auth";
import { verifyPayment } from "../controllers/payment";
const router = express.Router();

//adminLogs
router.post("/adminReg", adminRegister);
router.post("/adminLogin", adminLogin);

router.use(auth, requireAdmin);
//payment

router.use(auth, requireAdmin);
router.put("/verify-payment/:orderId", verifyPayment);

//metrics
import {
  getTotalSales,
  getActiveOrdersCount,
  getLowStockAlerts,
  getRecentActivities,
  getInventoryReport,
} from "../controllers/adminMetricsController";

router.get("/total-sales", getTotalSales);
router.get("/active-orders", getActiveOrdersCount);
router.get("/low-stock-alerts", getLowStockAlerts);
router.get("/recent-activities", getRecentActivities);
router.get("/get-inventory-report", getInventoryReport);

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

//Reports
import {
  generateSalesReport,
  getUserAnalytics,
} from "../controllers/adminReportsController";

router.get("/reports", generateSalesReport);
router.get("/analytics/users", getUserAnalytics);

//Category
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminCategoryController";

router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

//inventory route
router.get("/inventory-report", getInventoryReport);
export default router;

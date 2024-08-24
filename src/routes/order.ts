import express from "express";
import { auth, requireAdmin } from "../middleware/Auth";
import {
  approvePayment,
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  updateOrder,
} from "../controllers/orderController";
import OrderModel from "../models/OrderModel";

const router = express.Router();

router.use(auth);
// Order routes
router.post("/createOrder", createOrder);
router.get("/getAllOrders", getAllOrders);
router.get("/getOrder/:id", getOrder);
router.put("/updateOrder/:id", updateOrder);
router.delete("/deleteOrder/:id", deleteOrder);

router.use(requireAdmin);
router.put("/approve/:id", approvePayment);

export default router;

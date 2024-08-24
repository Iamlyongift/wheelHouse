"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
router.use(Auth_1.auth);
router.post("/createOrder", orderController_1.createOrder);
router.get("/getAllOrders", orderController_1.getAllOrders);
router.get("/getOrder/:id", orderController_1.getOrder);
router.put("/updateOrder/:id", orderController_1.updateOrder);
router.delete("/deleteOrder/:id", orderController_1.deleteOrder);
router.use(Auth_1.requireAdmin);
router.put("/approve/:id", orderController_1.approvePayment);
exports.default = router;

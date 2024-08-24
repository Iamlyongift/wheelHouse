"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.deleteOrder = exports.updateOrder = exports.getOrder = exports.approvePayment = exports.createOrder = void 0;
const utils_1 = require("../utils/utils");
const OrderModel_1 = __importDefault(require("../models/OrderModel"));
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { error, value } = utils_1.orderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { userId, items, shippingDetails } = value;
        const user = yield UserModel_1.default.findById(userId);
        if (!user || !user.email) {
            return res
                .status(400)
                .json({ message: "Invalid user or missing email address" });
        }
        const userEmail = user.email;
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = yield ProductModel_1.default.findById(item.product);
            if (!product) {
                return res
                    .status(404)
                    .json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${product.item_name}`,
                });
            }
            const orderItem = {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            };
            orderItems.push(orderItem);
            totalAmount += product.price * item.quantity;
            product.stock -= item.quantity;
            yield product.save();
        }
        const newOrder = new OrderModel_1.default({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingDetails,
            status: "pending",
            paymentStatus: "pending",
        });
        yield newOrder.save();
        const orderConfirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Your order has been placed",
            text: `Thank you for your order! Your order number is ${newOrder._id}. 
      Your order will be shipped to ${shippingDetails.name}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.country}, ${shippingDetails.postalCode}.
      Please complete your payment and upload the receipt to confirm your order.`,
        };
        yield emailConfig_1.default.sendMail(orderConfirmationMailOptions);
        res.status(201).json({
            message: "Order created successfully. Please complete payment and upload the receipt.",
            order: newOrder,
            paymentInstructions: {
                bankName: "Opay Bank",
                accountNumber: "7043707580",
                reference: `ORDER-${newOrder._id}`,
            },
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Error creating order",
            error: error.message,
        });
    }
});
exports.createOrder = createOrder;
const approvePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.orderId;
        const order = yield OrderModel_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = "paid";
        yield order.save();
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: order.user.email,
            subject: `Your payment for Order ${orderId} has been approved`,
            text: `Your payment for Order ${orderId} has been approved. Your order is now being processed.`,
        };
        yield emailConfig_1.default.sendMail(customerMailOptions);
        res.status(200).json({ message: "Payment approved successfully" });
    }
    catch (error) {
        console.error("Error approving payment:", error);
        res.status(500).json({
            message: "Error approving payment",
            error: error.message,
        });
    }
});
exports.approvePayment = approvePayment;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const order = yield OrderModel_1.default.findById(orderId)
            .populate("user")
            .populate("items.product");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching order", error });
    }
});
exports.getOrder = getOrder;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = utils_1.updateOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const orderId = req.params.id;
        const updatedOrder = yield OrderModel_1.default.findByIdAndUpdate(orderId, value, {
            new: true,
        });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating order", error });
    }
});
exports.updateOrder = updateOrder;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const deletedOrder = yield OrderModel_1.default.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ message: "Order deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting order", error });
    }
});
exports.deleteOrder = deleteOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OrderModel_1.default.find()
            .populate("user")
            .populate("items.product");
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
});
exports.getAllOrders = getAllOrders;

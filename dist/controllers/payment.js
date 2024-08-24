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
exports.verifyPayment = exports.bankDetail = void 0;
const OrderModel_1 = __importDefault(require("../models/OrderModel"));
const utils_1 = require("../utils/utils");
const bankDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield OrderModel_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const bankDetails = {
            accountName: "opay bank",
            accountNumber: "1234567890",
            bankName: "Arigo Technologies",
            bankAddress: "123 Bank St, Lagos, Nigeria",
        };
        res.status(200).json({ message: "Bank details retrieved", bankDetails });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving bank details" });
    }
});
exports.bankDetail = bankDetail;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = utils_1.verifyPaymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { orderId } = req.params;
        const { status } = req.body;
        const order = yield OrderModel_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status;
        yield order.save();
        res.status(200).json({ message: `Order ${status}`, order });
    }
    catch (error) {
        console.error("Error creating payment:", error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});
exports.verifyPayment = verifyPayment;

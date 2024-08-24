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
exports.getInventoryReport = exports.getRecentActivities = exports.getLowStockAlerts = exports.getActiveOrdersCount = exports.getTotalSales = void 0;
const OrderModel_1 = __importDefault(require("../models/OrderModel"));
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const getTotalSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalSales = yield OrderModel_1.default.aggregate([
            { $match: { status: { $in: ["approved", "paid"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]);
        const totalRevenueAmount = ((_a = totalSales[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
        res.status(200).json({ totalSales: totalRevenueAmount });
    }
    catch (error) {
        console.error("Error fetching total sales:", error);
        res.status(500).json({ message: "Error fetching total sales" });
    }
});
exports.getTotalSales = getTotalSales;
const getActiveOrdersCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeOrdersCount = yield OrderModel_1.default.countDocuments({
            status: { $in: ["processing", "shipped"] },
        });
        res.status(200).json({ activeOrdersCount });
    }
    catch (error) {
        console.error("Error fetching active orders count:", error);
        res.status(500).json({ message: "Error fetching active orders count" });
    }
});
exports.getActiveOrdersCount = getActiveOrdersCount;
const getLowStockAlerts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lowStockProducts = yield ProductModel_1.default.find({ stock: { $lt: 5 } });
        res.status(200).json({ lowStockProducts });
    }
    catch (error) {
        console.error("Error fetching low stock alerts:", error);
        res.status(500).json({ message: "Error fetching low stock alerts" });
    }
});
exports.getLowStockAlerts = getLowStockAlerts;
const getRecentActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentOrders = yield OrderModel_1.default.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        })
            .sort({ createdAt: -1 })
            .limit(10);
        const recentProducts = yield ProductModel_1.default.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        })
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({ recentOrders, recentProducts });
    }
    catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json({ message: "Error fetching recent activities" });
    }
});
exports.getRecentActivities = getRecentActivities;
const getInventoryReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lowStockThreshold = 10;
        const lowStockItems = yield ProductModel_1.default.find({
            stock: { $lt: lowStockThreshold },
        });
        const allProducts = yield ProductModel_1.default.find({});
        const report = {
            totalProducts: allProducts.length,
            lowStockItems: lowStockItems,
        };
        return res.status(200).json(report);
    }
    catch (error) {
        console.error("Error in getInventoryReport:", error);
        return res
            .status(500)
            .json({ message: "Error generating inventory report" });
    }
});
exports.getInventoryReport = getInventoryReport;

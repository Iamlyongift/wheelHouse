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
exports.getUserAnalytics = exports.generateSalesReport = void 0;
const OrderModel_1 = __importDefault(require("../models/OrderModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const generateSalesReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, productId, categoryId } = req.query;
        const query = {};
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ message: "Invalid start date" });
            }
            query.createdAt = { $gte: start };
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid end date" });
            }
            query.createdAt = query.createdAt || {};
            query.createdAt.$lte = end;
        }
        if (productId) {
            query["items.product"] = productId;
        }
        if (categoryId) {
            query["items.product.category"] = categoryId;
        }
        const sales = yield OrderModel_1.default.find(query)
            .populate({
            path: "items.product",
            populate: { path: "category" },
        })
            .exec();
        if (!sales) {
            return res.status(404).json({ message: "No sales data found" });
        }
        const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);
        res.status(200).json({ totalRevenue, sales });
    }
    catch (error) {
        console.error("Error generating sales report:", error);
        res.status(500).json({ message: "Error generating sales report" });
    }
});
exports.generateSalesReport = generateSalesReport;
const getUserAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const frequentBuyers = yield UserModel_1.default.aggregate([
            { $match: { role: "user" } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "user",
                    as: "orders",
                },
            },
            { $addFields: { orderCount: { $size: "$orders" } } },
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
        ]);
        const popularProducts = yield OrderModel_1.default.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    count: { $sum: "$items.quantity" },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    product: {
                        _id: 1,
                        name: 1,
                        price: 1,
                        category: 1,
                    },
                    count: 1,
                },
            },
        ]);
        const trafficSources = yield UserModel_1.default.aggregate([
            { $group: { _id: "$referralSource", count: { $sum: 1 } } },
        ]);
        res.status(200).json({ frequentBuyers, popularProducts, trafficSources });
    }
    catch (error) {
        console.error("Error fetching user analytics:", error);
        res.status(500).json({ message: "Error fetching user analytics" });
    }
});
exports.getUserAnalytics = getUserAnalytics;

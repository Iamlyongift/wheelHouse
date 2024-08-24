import { Request, Response } from "express";
import OrderModel from "../models/OrderModel";
import UserModel from "../models/UserModel";
import ProductModel from "../models/ProductModel";

// Get total sales/revenue
export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const totalSales = await OrderModel.aggregate([
      { $match: { status: { $in: ["approved", "paid"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenueAmount = totalSales[0]?.totalRevenue || 0;
    res.status(200).json({ totalSales: totalRevenueAmount });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    res.status(500).json({ message: "Error fetching total sales" });
  }
};

// Get number of active orders
export const getActiveOrdersCount = async (req: Request, res: Response) => {
  try {
    const activeOrdersCount = await OrderModel.countDocuments({
      status: { $in: ["processing", "shipped"] },
    });

    res.status(200).json({ activeOrdersCount });
  } catch (error) {
    console.error("Error fetching active orders count:", error);
    res.status(500).json({ message: "Error fetching active orders count" });
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const lowStockProducts = await ProductModel.find({ stock: { $lt: 5 } });

    res.status(200).json({ lowStockProducts });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({ message: "Error fetching low stock alerts" });
  }
};

// Get recent activities
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    // Recent orders (last 7 days)
    const recentOrders = await OrderModel.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent products added (last 7 days)
    const recentProducts = await ProductModel.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ recentOrders, recentProducts });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};

// Overview of stock levels, with alerts for low-stock items
export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    // Find products that are low on stock, e.g., less than 10 items
    const lowStockThreshold = 10;
    const lowStockItems = await ProductModel.find({
      stock: { $lt: lowStockThreshold },
    });

    // Get the overall stock levels
    const allProducts = await ProductModel.find({});

    // Prepare the response data
    const report = {
      totalProducts: allProducts.length,
      lowStockItems: lowStockItems,
    };

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error in getInventoryReport:", error);
    return res
      .status(500)
      .json({ message: "Error generating inventory report" });
  }
};

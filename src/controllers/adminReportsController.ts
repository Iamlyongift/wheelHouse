import { Request, Response } from "express";
import OrderModel from "../models/OrderModel";
import UserModel from "../models/UserModel";

// Generate sales reports; // Adjust path as needed
export const generateSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, productId, categoryId } = req.query;

    const query: any = {};

    // Validate and build query for date range
    if (startDate) {
      const start = new Date(startDate as string);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid start date" });
      }
      query.createdAt = { $gte: start };
    }

    if (endDate) {
      const end = new Date(endDate as string);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid end date" });
      }
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = end;
    }

    // Add product and category filters if provided
    if (productId) {
      query["items.product"] = productId;
    }

    if (categoryId) {
      query["items.product.category"] = categoryId;
    }

    // Perform the query and populate necessary fields
    const sales = await OrderModel.find(query)
      .populate({
        path: "items.product",
        populate: { path: "category" }, // Populating the category within the product
      })
      .exec();

    if (!sales) {
      return res.status(404).json({ message: "No sales data found" });
    }

    // Calculate total revenue
    const totalRevenue = sales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    );

    res.status(200).json({ totalRevenue, sales });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
};

// Get user analytics
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    // Frequent buyers
    const frequentBuyers = await UserModel.aggregate([
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

    // Popular products
    const popularProducts = await OrderModel.aggregate([
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

    // Traffic sources (example: referral, direct, etc.)
    const trafficSources = await UserModel.aggregate([
      { $group: { _id: "$referralSource", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ frequentBuyers, popularProducts, trafficSources });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ message: "Error fetching user analytics" });
  }
};

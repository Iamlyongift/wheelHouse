import OrderModel from "../models/OrderModel";
import { Request, Response } from "express";
import { verifyPaymentSchema } from "../utils/utils";

export const bankDetail = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Company bank details (this could also be stored in environment variables or a separate config)
    const bankDetails = {
      accountName: "opay bank",
      accountNumber: "1234567890",
      bankName: "Arigo Technologies",
      bankAddress: "123 Bank St, Lagos, Nigeria",
    };

    res.status(200).json({ message: "Bank details retrieved", bankDetails });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bank details" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { error } = verifyPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { orderId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the payment status based on admin approval
    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order ${status}`, order });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

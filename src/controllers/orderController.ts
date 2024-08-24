import { Request, Response } from "express";
import { orderSchema, updateOrderSchema } from "../utils/utils";
import OrderModel from "../models/OrderModel";
import ProductModel from "../models/ProductModel";
import transporter from "../emailConfig";
import UserModel from "../models/UserModel";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate the request body
    console.log(req.body);

    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId, items, shippingDetails } = value;

    // Find the user and verify the email
    const user = await UserModel.findById(userId);
    if (!user || !user.email) {
      return res
        .status(400)
        .json({ message: "Invalid user or missing email address" });
    }

    const userEmail = user.email;

    // Validate and calculate the total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.product);
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

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create the order
    const newOrder = new OrderModel({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingDetails,
      status: "pending",
      paymentStatus: "pending",
    });

    await newOrder.save();

    // Prepare the email content for order confirmation
    const orderConfirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your order has been placed",
      text: `Thank you for your order! Your order number is ${newOrder._id}. 
      Your order will be shipped to ${shippingDetails.name}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.country}, ${shippingDetails.postalCode}.
      Please complete your payment and upload the receipt to confirm your order.`,
    };

    // Send the order confirmation email
    await transporter.sendMail(orderConfirmationMailOptions);

    res.status(201).json({
      message:
        "Order created successfully. Please complete payment and upload the receipt.",
      order: newOrder,
      paymentInstructions: {
        bankName: "Opay Bank",
        accountNumber: "7043707580",
        reference: `ORDER-${newOrder._id}`,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Error creating order",
      error: (error as Error).message,
    });
  }
};

export const approvePayment = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "paid";
    await order.save();
    

    // Send email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email, // Assuming you have the user's email in the order or can fetch it
      subject: `Your payment for Order ${orderId} has been approved`,
      text: `Your payment for Order ${orderId} has been approved. Your order is now being processed.`,
    };

    await transporter.sendMail(customerMailOptions);

    res.status(200).json({ message: "Payment approved successfully" });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({
      message: "Error approving payment",
      error: (error as Error).message,
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId)
      .populate("user")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const orderId = req.params.id;
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, value, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find()
      .populate("user")
      .populate("items.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface shippingDetails {
  name: string;
  address: string;
  city: string;
  country: string;
  postalcode: string;
}

export interface OrderType extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: "pending" | "approved" | "rejected" | "paid";
  totalAmouunt: number;
  receiptPath?: string;
  totalAmount: number;
  shippingDetails: shippingDetails;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    shippingDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
  },

  { timestamps: true }
);

const OrderModel = mongoose.model<OrderType>("Order", OrderSchema);

export default OrderModel;

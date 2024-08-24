import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface CartType extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const CartSchema: Schema = new Schema(
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
      },
    ],
  },
  { timestamps: true }
);

const CartModel = mongoose.model<CartType>("Cart", CartSchema);

export default CartModel;

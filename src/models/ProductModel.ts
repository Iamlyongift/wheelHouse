import mongoose, { Schema, Document } from "mongoose";

export interface ProductType extends Document {
  _id: mongoose.Types.ObjectId;
  item_name: string;
  category: mongoose.Types.ObjectId; // Updated to reference the Category model
  price: number;
  description: string;
  stock: number;
  images: string[];
}

const ProductSchema: Schema = new Schema(
  {
    item_name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Referencing Category model
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<ProductType>("Product", ProductSchema);

export default ProductModel;

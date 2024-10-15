import mongoose, { Schema, Document } from "mongoose";

export interface ProductType extends Document {
  _id: mongoose.Types.ObjectId;
  productName: string;
  category: mongoose.Types.ObjectId; // Reference to the Category model
  price: number;
  description: string;
  stock: number;
  images: string[];
  productType: string;  // Added this field to differentiate between house and car
}

const ProductSchema: Schema = new Schema(
  {
    productName: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Referencing Category model
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
    productType: { type: String, enum: ['house', 'car'], required: true }, // New field for type
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<ProductType>("Product", ProductSchema);

export default ProductModel;

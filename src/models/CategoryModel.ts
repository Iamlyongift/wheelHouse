import mongoose, { Document, Schema } from "mongoose";

export interface CategoryType extends Document {
  name: string;
  description?: string;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model<CategoryType>("Category", categorySchema);

export default CategoryModel;

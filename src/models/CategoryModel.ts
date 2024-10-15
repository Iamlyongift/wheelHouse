import mongoose, { Document, Schema } from "mongoose";

export interface CategoryType extends Document {
  name: string;
  description: string;
  type: 'car' | 'house'; // Restrict type to either 'car' or 'house'
}

const categorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['car', 'house'], // Only allow 'car' or 'house'
  },
});
const CategoryModel = mongoose.model<CategoryType>("Category", categorySchema);

export default CategoryModel;

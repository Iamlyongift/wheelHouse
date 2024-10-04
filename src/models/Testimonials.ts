// models/Testimonial.ts
import mongoose, { Document, Schema } from "mongoose";

interface TestimonialType extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  name: string;
  review: string;
  date: Date;
  rating: number;
  description: string;
}

const TestimonialSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  review: { type: String, required: true },
  date: { type: Date, default: Date.now },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
});

const TestimonialModel = mongoose.model<TestimonialType>(
  "Testimonial",
  TestimonialSchema
);

export default TestimonialModel;

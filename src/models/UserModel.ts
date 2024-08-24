import mongoose, { Document, Schema } from "mongoose";

export interface UserType extends Document {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  country?: string;
  role: "user" | "admin";
  isActive: boolean; // New field to track user status
  toggleAccountStatus: () => Promise<void>; // Method to toggle account status
}

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: false },
    country: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true }, // Added isActive field with default value
    Orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Method to toggle the isActive status
userSchema.methods.toggleAccountStatus = async function () {
  this.isActive = !this.isActive;
  await this.save();
};

// Static method to toggle the isActive status by user ID
userSchema.statics.toggleAccountStatusById = async function (userId: string) {
  const user = await this.findById(userId);
  if (user) {
    user.isActive = !user.isActive;
    await user.save();
  }
};

const UserModel = mongoose.model<UserType>("User", userSchema);

export default UserModel;

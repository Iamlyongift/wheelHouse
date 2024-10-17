import mongoose, { Document, Schema, Model } from "mongoose";

// Define the user interface that extends Document
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
  profilePhoto?: string;
  role: "user" | "admin";
  isActive: boolean;
  toggleAccountStatus: () => Promise<void>; // Instance method to toggle status
}

// Define the static methods interface
interface UserModelType extends Model<UserDocument> {
  toggleAccountStatusById: (userId: string) => Promise<void>; // Static method to toggle status
}

// Define the schema
const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    country: { type: String, required: true },
    profilePhoto: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);

// Instance method to toggle account status
userSchema.methods.toggleAccountStatus = async function (): Promise<void> {
  this.isActive = !this.isActive;
  await this.save();
};

// Static method to toggle account status by user ID
userSchema.statics.toggleAccountStatusById = async function (userId: string): Promise<void> {
  const user = await this.findById(userId);
  if (user) {
    user.isActive = !user.isActive;
    await user.save();
  }
};

// Create the model with both instance and static methods
const UserModel = mongoose.model<UserDocument, UserModelType>("User", userSchema);

export default UserModel;

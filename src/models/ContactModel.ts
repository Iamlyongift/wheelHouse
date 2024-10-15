// src/models/Contact.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ContactType extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const contactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ContactModel = mongoose.model<ContactType>("Contact", contactSchema);

export default ContactModel;

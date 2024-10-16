// src/controllers/contactController.ts
import { Request, Response } from "express";
import ContactModel from "../models/ContactModel";
import { contactSchema } from "../utils/utils";

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, phone, email, message } = req.body;

  // Validate user input
  const { error } = contactSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.error("Validation error:", error.details);
    return res.status(400).json({
      errors: error.details.map((err) => err.message), // Collect all validation messages
    });
  }

  try {
    // Check for existing submission (optional, based on your requirements)
    const existingContact = await ContactModel.findOne({ email });
    if (existingContact) {
      return res.status(200).json({ message: 'We already received your request. We will get back to you shortly.' });
    }

    // Create new contact submission
    const newContact = await ContactModel.create({
      name,
      phone,
      email,
      message,
    });

    console.log("New contact submission:", newContact);

    // Respond with success
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error("Error submitting contact form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


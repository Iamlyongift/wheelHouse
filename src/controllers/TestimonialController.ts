// controllers/testimonialController.ts
import { Request, Response } from "express";
import TestimonialModel from "../models/Testimonials";

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, review, rating, description } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Create the testimonial with the required name field
    const newTestimonial = new TestimonialModel({
      user: userId,
      name, // Include name
      review,
      rating,
      description,
    });

    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    res
      .status(500)
      .json({ error: "Failed to create testimonial", details: error.message });
  }
};

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await TestimonialModel.find().sort({ date: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

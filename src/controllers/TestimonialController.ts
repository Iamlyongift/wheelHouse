// controllers/testimonialController.ts
import { Request, Response } from 'express';
import TestimonialModel from '../models/Testimonials';



export const createTestimonial = async (req: Request, res: Response) => {
    try {
      const { review, rating, description } = req.body;
      const userId = req.user._id; // Extract the user ID from the request (assuming it's added in the auth middleware)
  
      // Create the testimonial
      const newTestimonial = new TestimonialModel({
        user: userId,
        review,
        rating,
        description,
      });
  
      await newTestimonial.save();
      res.status(201).json(newTestimonial);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create testimonial' });
    }
  };

  
export const getTestimonials = async (req: Request, res: Response) => {
    try {
      const testimonials = await TestimonialModel.find().sort({ date: -1 });
      res.status(200).json(testimonials);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  };
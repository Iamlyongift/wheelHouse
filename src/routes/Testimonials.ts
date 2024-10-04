// routes/testimonialRoutes.ts
import express from "express";
import {
  createTestimonial,
  getTestimonials,
} from "../controllers/TestimonialController";
import { auth } from "../middleware/Auth";

const router = express.Router();

router.get("/testimonials", getTestimonials);
router.use(auth);
router.post("/create-testimonials", createTestimonial); // Use the auth middleware

export default router;

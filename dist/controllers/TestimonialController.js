"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonials = exports.createTestimonial = void 0;
const Testimonials_1 = __importDefault(require("../models/Testimonials"));
const createTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, review, rating, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const newTestimonial = new Testimonials_1.default({
            user: userId,
            name,
            review,
            rating,
            description,
        });
        yield newTestimonial.save();
        res.status(201).json(newTestimonial);
    }
    catch (error) {
        console.error("Error creating testimonial:", error);
        res
            .status(500)
            .json({ error: "Failed to create testimonial", details: error.message });
    }
});
exports.createTestimonial = createTestimonial;
const getTestimonials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonials = yield Testimonials_1.default.find().sort({ date: -1 });
        res.status(200).json(testimonials);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch testimonials" });
    }
});
exports.getTestimonials = getTestimonials;

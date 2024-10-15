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
exports.submitContactForm = void 0;
const ContactModel_1 = __importDefault(require("../models/ContactModel"));
const utils_1 = require("../utils/utils");
const submitContactForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, message } = req.body;
    const { error } = utils_1.contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.error("Validation error:", error.details);
        return res.status(400).json({
            errors: error.details.map((err) => err.message),
        });
    }
    try {
        const existingContact = yield ContactModel_1.default.findOne({ email });
        if (existingContact) {
            return res.status(200).json({ message: 'We already received your request. We will get back to you shortly.' });
        }
        const newContact = yield ContactModel_1.default.create({
            name,
            phone,
            email,
            message,
        });
        console.log("New contact submission:", newContact);
        res.status(200).json({ message: "Form submitted successfully!" });
    }
    catch (err) {
        console.error("Error submitting contact form:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.submitContactForm = submitContactForm;

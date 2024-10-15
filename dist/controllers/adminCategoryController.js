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
exports.getAllMessages = exports.getCategory = exports.deleteCategory = exports.updateCategory = exports.getCategoriesByType = exports.createCategory = void 0;
const CategoryModel_1 = __importDefault(require("../models/CategoryModel"));
const ContactModel_1 = __importDefault(require("../models/ContactModel"));
const utils_1 = require("../utils/utils");
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateCategory = utils_1.categorySchema.validate(req.body);
        if (validateCategory.error) {
            return res
                .status(400)
                .json({ Error: validateCategory.error.details[0].message });
        }
        const { name, description, type } = req.body;
        if (type !== 'car' && type !== 'house') {
            return res.status(400).json({
                message: "Invalid type. Only 'car' or 'house' are allowed.",
            });
        }
        const newCategory = yield CategoryModel_1.default.create({ name, description, type });
        res.status(201).json({ message: "Category created successfully", newCategory });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Error creating category" });
    }
});
exports.createCategory = createCategory;
const getCategoriesByType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.params;
        if (type !== 'car' && type !== 'house') {
            return res.status(400).json({
                message: "Invalid type. Only 'car' or 'house' are allowed.",
            });
        }
        const categories = yield CategoryModel_1.default.find({ type });
        res.status(200).json({ categories });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
});
exports.getCategoriesByType = getCategoriesByType;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const validateCategory = utils_1.categorySchema.validate(req.body);
        if (validateCategory.error) {
            return res
                .status(400)
                .json({ Error: validateCategory.error.details[0].message });
        }
        const updatedCategory = yield CategoryModel_1.default.findByIdAndUpdate(categoryId, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res
            .status(200)
            .json({ message: "Category updated successfully", updatedCategory });
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category" });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const deletedCategory = yield CategoryModel_1.default.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Error deleting category" });
    }
});
exports.deleteCategory = deleteCategory;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield CategoryModel_1.default.find({});
        res.status(200).json({ categories });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching categories" });
    }
});
exports.getCategory = getCategory;
const getAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allContacts = yield ContactModel_1.default.find();
        res.status(200).json({
            message: "Messages retrieved successfully!",
            data: allContacts,
        });
    }
    catch (err) {
        console.error("Error retrieving messages:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllMessages = getAllMessages;

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
exports.getCars = exports.getHouses = exports.deleteProduct = exports.updateProduct = exports.getSingleProduct = exports.getAllProducts = exports.createProduct = void 0;
const cloudinary_1 = require("cloudinary");
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const CategoryModel_1 = __importDefault(require("../models/CategoryModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const utils_1 = require("../utils/utils");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = utils_1.creatProductSchema.validate(req.body, utils_1.option);
        if (error) {
            console.error("Validation Error:", error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }
        const { productName, category, description, price, stock, productType } = req.body;
        console.log("Request Body:", req.body);
        if (!['house', 'car'].includes(productType)) {
            return res.status(400).json({ message: "Invalid product type" });
        }
        const foundCategory = yield CategoryModel_1.default.findOne({ name: category });
        if (!foundCategory) {
            console.warn("Category not found:", category);
            return res.status(404).json({ message: "Category not found" });
        }
        let pictureUrls = [];
        if (req.files && Array.isArray(req.files)) {
            console.log("Files received:", req.files);
            try {
                const uploadResults = yield Promise.all(req.files.map((file) => cloudinary_1.v2.uploader.upload(file.path)));
                pictureUrls = uploadResults.map((result) => result.secure_url);
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({ message: "Error uploading images" });
            }
        }
        else if (req.body.images && Array.isArray(req.body.images)) {
            pictureUrls = req.body.images;
            console.log("Images from request body:", pictureUrls);
        }
        const product = yield ProductModel_1.default.create({
            productName,
            category: foundCategory._id,
            description,
            price,
            stock,
            images: pictureUrls,
            productType,
        });
        console.log("Product created:", product);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "New Product Created",
            text: `A new product "${productName}" has been created in the category "${foundCategory.name}".`,
        };
        yield emailConfig_1.default.sendMail(mailOptions);
        console.log("Email notification sent to admin.");
        return res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        console.error("Error in createProduct:", error);
        return res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
const getAllProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield ProductModel_1.default.find();
        return res.status(200).json({
            message: "Products fetched successfully",
            products,
        });
    }
    catch (error) {
        console.error("Error fetching all products:", error);
        return res.status(500).json({ message: "Error fetching products" });
    }
});
exports.getAllProducts = getAllProducts;
const getSingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield ProductModel_1.default.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            message: "Product fetched successfully",
            product,
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Error fetching product" });
    }
});
exports.getSingleProduct = getSingleProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { error } = utils_1.updateProductSchema.validate(req.body, utils_1.option);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const existingProduct = yield ProductModel_1.default.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        const updatedProduct = yield ProductModel_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
            context: "query",
        });
        return res.status(200).json({
            message: "Product updated successfully",
            updatedProduct,
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "An error occurred while updating the product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedProduct = yield ProductModel_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            message: "Product deleted successfully",
            deletedProduct,
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "An error occurred while deleting the product" });
    }
});
exports.deleteProduct = deleteProduct;
const getHouses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const houses = yield ProductModel_1.default.find({ productType: "house" });
        return res.status(200).json(houses);
    }
    catch (error) {
        console.error("Error fetching houses:", error);
        return res.status(500).json({ message: "Error fetching houses" });
    }
});
exports.getHouses = getHouses;
const getCars = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cars = yield ProductModel_1.default.find({ productType: "car" });
        return res.status(200).json(cars);
    }
    catch (error) {
        console.error("Error fetching cars:", error);
        return res.status(500).json({ message: "Error fetching cars" });
    }
});
exports.getCars = getCars;

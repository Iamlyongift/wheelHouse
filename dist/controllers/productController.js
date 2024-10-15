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
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const utils_1 = require("../utils/utils");
const cloudinary_1 = require("cloudinary");
const CategoryModel_1 = __importDefault(require("../models/CategoryModel"));
const emailConfig_1 = __importDefault(require("../emailConfig"));
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateProduct = utils_1.creatProductSchema.validate(req.body, utils_1.option);
        if (validateProduct.error) {
            console.log("Validation Error:", validateProduct.error.details[0].message);
            return res
                .status(400)
                .json({ Error: validateProduct.error.details[0].message });
        }
        const { productName, category, description, price, stock, productType } = req.body;
        console.log("Request Body:", req.body);
        if (!['house', 'car'].includes(productType)) {
            return res.status(400).json({ message: "Invalid product type" });
        }
        const foundCategory = yield CategoryModel_1.default.findOne({ name: category });
        if (!foundCategory) {
            console.log("Category not found:", category);
            return res.status(404).json({ message: "Category not found" });
        }
        console.log("Found Category:", foundCategory);
        let pictureUrls = [];
        if (req.files && Array.isArray(req.files)) {
            try {
                console.log("Files received for upload:", req.files);
                const uploadPromises = req.files.map((file) => cloudinary_1.v2.uploader.upload(file.path));
                const results = yield Promise.all(uploadPromises);
                pictureUrls = results.map((result) => result.secure_url);
                console.log("Uploaded Image URLs:", pictureUrls);
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({ message: "Error uploading images" });
            }
        }
        else if (req.body.images && Array.isArray(req.body.images)) {
            pictureUrls = req.body.images;
            console.log("Image URLs from body:", pictureUrls);
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
        console.log(mailOptions);
        yield emailConfig_1.default.sendMail(mailOptions);
        console.log("Email sent to admin.");
        res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllProduct = yield ProductModel_1.default.find();
        res.status(200).json({
            msg: "Product sucessfully fetched",
            getAllProduct,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAllProducts = getAllProducts;
const getSingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield ProductModel_1.default.findById(id);
        if (!product) {
            return res.status(400).json({
                msg: "product not found",
            });
        }
        res.status(200).json({
            msg: "product sucessfully fetched",
            product,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getSingleProduct = getSingleProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const validateUser = utils_1.updateProductSchema.validate(req.body, utils_1.option);
        if (validateUser.error) {
            return res
                .status(400)
                .json({ Error: validateUser.error.details[0].message });
        }
        const product = yield ProductModel_1.default.findById(id);
        if (!product) {
            return res.status(400).json({
                error: "program not found",
            });
        }
        const updateProduct = yield ProductModel_1.default.findByIdAndUpdate(id, Object.assign({}, req.body), {
            new: true,
            runValidators: true,
            context: "query",
        });
        if (!updateProduct) {
            return res.status(404).json({
                msg: "product not updated",
            });
        }
        return res.status(200).json({
            message: "product updated successfully",
            updateProduct,
        });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "An error occurred while updating the product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield ProductModel_1.default.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                message: "product not found",
            });
        }
        res.status(200).json({
            message: "product successfully deleted",
            product,
        });
    }
    catch (error) {
        console.log("Problem deleting product");
    }
});
exports.deleteProduct = deleteProduct;
const getHouses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const houses = yield ProductModel_1.default.find({ productType: 'house' });
        res.status(200).json(houses);
    }
    catch (error) {
        console.error("Error fetching houses:", error);
        res.status(500).json({ message: "Error fetching houses" });
    }
});
exports.getHouses = getHouses;
const getCars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cars = yield ProductModel_1.default.find({ productType: 'car' });
        res.status(200).json(cars);
    }
    catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).json({ message: "Error fetching cars" });
    }
});
exports.getCars = getCars;

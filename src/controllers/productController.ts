import { Request, Response } from "express";
import { v2 as cloudinaryV2 } from "cloudinary";
import ProductModel from "../models/ProductModel";
import CategoryModel from "../models/CategoryModel";
import transport from "../emailConfig";
import {
  creatProductSchema,
  updateProductSchema,
  option,
} from "../utils/utils";

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { error } = creatProductSchema.validate(req.body, option);
    if (error) {
      console.error("Validation Error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productName, category, description, price, stock, productType } = req.body;
    console.log("Request Body:", req.body);

    if (!['house', 'car'].includes(productType)) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    const foundCategory = await CategoryModel.findOne({ name: category });
    if (!foundCategory) {
      console.warn("Category not found:", category);
      return res.status(404).json({ message: "Category not found" });
    }

    let pictureUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      console.log("Files received:", req.files);
      try {
        const uploadResults = await Promise.all(
          req.files.map((file) => cloudinaryV2.uploader.upload(file.path))
        );
        pictureUrls = uploadResults.map((result) => result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading images" });
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      pictureUrls = req.body.images;
      console.log("Images from request body:", pictureUrls);
    }

    const product = await ProductModel.create({
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

    await transport.sendMail(mailOptions);
    console.log("Email notification sent to admin.");

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return res.status(500).json({ message: "Error creating product" });
  }
};

// Get all products
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await ProductModel.find();
    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    return res.status(500).json({ message: "Error fetching products" });
  }
};

// Get a single product by ID
export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Error fetching product" });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = updateProductSchema.validate(req.body, option);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    return res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "An error occurred while updating the product" });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "An error occurred while deleting the product" });
  }
};

// Get all houses
export const getHouses = async (_req: Request, res: Response) => {
  try {
    const houses = await ProductModel.find({ productType: "house" });
    return res.status(200).json(houses);
  } catch (error) {
    console.error("Error fetching houses:", error);
    return res.status(500).json({ message: "Error fetching houses" });
  }
};

// Get all cars
export const getCars = async (_req: Request, res: Response) => {
  try {
    const cars = await ProductModel.find({ productType: "car" });
    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return res.status(500).json({ message: "Error fetching cars" });
  }
};

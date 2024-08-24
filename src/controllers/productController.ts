import { Request, Response } from "express";
import ProductModel from "../models/ProductModel";
import {
  creatProductSchema,
  option,
  updateProductSchema,
} from "../utils/utils";
import { v2 as cloudinaryV2 } from "cloudinary";
import CategoryModel from "../models/CategoryModel";
// import transporter from "../emailConfig";
import transport from "../emailConfig";

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate the request body using productSchema
    const validateProduct = creatProductSchema.validate(req.body, option);
    if (validateProduct.error) {
      console.log(
        "Validation Error:",
        validateProduct.error.details[0].message
      );
      return res
        .status(400)
        .json({ Error: validateProduct.error.details[0].message });
    }

    // Destructure and assign the values from the request body
    const { item_name, category, description, price, stock } = req.body;
    console.log("Request Body:", req.body);

    // Find the category by name
    const foundCategory = await CategoryModel.findOne({ name: category });
    if (!foundCategory) {
      console.log("Category not found:", category);
      return res.status(404).json({ message: "Category not found" });
    }
    console.log("Found Category:", foundCategory);

    // Initialize an array to store picture URLs
    let pictureUrls: string[] = [];

    // Check if files were uploaded
    if (req.files && Array.isArray(req.files)) {
      try {
        console.log("Files received for upload:", req.files);
        // Upload each image to Cloudinary and store its URL
        const uploadPromises = req.files.map((file) =>
          cloudinaryV2.uploader.upload(file.path)
        );
        const results = await Promise.all(uploadPromises);
        pictureUrls = results.map((result) => result.secure_url);
        console.log("Uploaded Image URLs:", pictureUrls);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading images" });
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      // If no files were uploaded, use the image URLs from the request body if provided
      pictureUrls = req.body.images;
      console.log("Image URLs from body:", pictureUrls);
    }

    // Create a new product instance
    const product = await ProductModel.create({
      item_name,
      category: foundCategory._id, // Use the _id of the found category
      description,
      price,
      stock,
      images: pictureUrls, // Store an array of image URLs
    });
    console.log("Product created:", product);

    // Send email notification (assuming email configuration is already set up)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Admin's email
      subject: "New Product Created",
      text: `A new product "${item_name}" has been created in the category "${foundCategory.name}".`,
    };

    await transport.sendMail(mailOptions);
    console.log("Email sent to admin.");

    // Return a success response
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error in createProduct:", error);
    // Return an error response in case of exceptions
    res.status(500).json({ message: "Error creating product" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const getAllProduct = await ProductModel.find().populate("orders");
    res.status(200).json({
      msg: "Program sucessfully fetched",
      getAllProduct,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(400).json({
        msg: "product not found",
      });
    }
    res.status(200).json({
      msg: "product sucessfully fetched",
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate the request body
    const validateUser = updateProductSchema.validate(req.body, option);
    if (validateUser.error) {
      return res
        .status(400)
        .json({ Error: validateUser.error.details[0].message });
    }

    // Check if the product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(400).json({
        error: "program not found",
      });
    }

    // Update the product
    const updateProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!updateProduct) {
      return res.status(404).json({
        msg: "product not updated",
      });
    }

    return res.status(200).json({
      message: "product updated successfully",
      updateProduct,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the product" });
  }
};

//delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    res.status(200).json({
      message: "product successfully deleted",
      product,
    });
  } catch (error) {
    console.log("Problem deleting product");
  }
};

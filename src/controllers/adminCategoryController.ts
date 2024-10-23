import { Request, Response } from "express";
import CategoryModel from "../models/CategoryModel";

import ContactModel from "../models/ContactModel";
import { categorySchema } from "../utils/utils";

// createcategory/
export const createCategory = async (req: Request, res: Response) => {
  try {
    const validateCategory = categorySchema.validate(req.body);
    if (validateCategory.error) {
      return res
        .status(400)
        .json({ Error: validateCategory.error.details[0].message });
    }

    const { name, description, type } = req.body;

    // Validate that the type is either 'car' or 'house'
    if (type !== 'car' && type !== 'house') {
      return res.status(400).json({
        message: "Invalid type. Only 'car' or 'house' are allowed.",
      });
    }

    const newCategory = await CategoryModel.create({ name, description, type });
    res.status(201).json({ message: "Category created successfully", newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category" });
  }
};

export const getCategoriesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Validate that the type is either 'car' or 'house'
    if (type !== 'car' && type !== 'house') {
      return res.status(400).json({
        message: "Invalid type. Only 'car' or 'house' are allowed.",
      });
    }

    // Fetch categories based on the type
    const categories = await CategoryModel.find({ type });
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // Validate the input data using the schema
    const validateCategory = categorySchema.validate(req.body);
    if (validateCategory.error) {
      return res
        .status(400)
        .json({ Error: validateCategory.error.details[0].message });
    }

    // Proceed with updating the category
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error updating category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error deleting category" });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    // Fetch categories from the database
    const categories = await CategoryModel.find({});

    // Send the categories in the response
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
};


export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const allContacts = await ContactModel.find();

    // Respond with the retrieved messages
    res.status(200).json({
      message: "Messages retrieved successfully!",
      data: allContacts,
    });
  } catch (err) {
    console.error("Error retrieving messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

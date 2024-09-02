import { Request, Response } from "express";
import CategoryModel from "../models/CategoryModel";
import { categorySchema } from "../utils/utils";

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const validateCategory = categorySchema.validate(req.body);
    if (validateCategory.error) {
      return res
        .status(400)
        .json({ Error: validateCategory.error.details[0].message });
    }
    const { name, description } = req.body;
    const newCategory = await CategoryModel.create({ name, description });
    res
      .status(201)
      .json({ message: "Category created successfully", newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category" });
  }
};

// Update an existing category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      req.body,
      {
        new: true,
      }
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

// Delete a category
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
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
}

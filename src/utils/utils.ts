import { Request, Response, NextFunction } from 'express';

import Joi from "joi";


// Define validation schema for the email input
export const emailSchema = Joi.object({
  subject: Joi.string().required().messages({
    'string.empty': 'Subject is required',
  }),
  messageContent: Joi.string().required().messages({
    'string.empty': 'Message content is required',
  }),
});




export const RegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8) // Adjusted minimum length to 8 for better security
    .regex(/^[a-zA-Z0-9!@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/?]{8,30}$/) // Updated regex to include special characters
    .required(),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .label("confirm_password")
    .messages({ "any.only": "{{#label}} does not match" }),
  phoneNumber: Joi.string().min(7).max(15).required(), // Adjusted length based on common phone number formats
  country: Joi.string().required(),
  profilePhoto: Joi.string().uri().optional(), // Assuming profile_photo is a URL; adjust if needed
});

export const LoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string()
    .min(6)
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

export const option = {
  abortearly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

export const adminRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  phoneNumber: Joi.string().min(7).max(15).required(),
  country: Joi.string().required(),
});

export const adminLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});

export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  password: Joi.string().min(8).optional(), // Make password optional
  confirm_password: Joi.string().valid(Joi.ref('password')).optional(),
  profilePhoto: Joi.string().optional(),
});






export const creatProductSchema = Joi.object({
  productName: Joi.string().required().messages({
    "string.empty": "Product name is required",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),
  stock: Joi.number().required().min(0).messages({
    "number.base": "Stock must be a number",
    "any.required": "Stock is required",
    "number.min": "Stock cannot be less than 0",
  }),
  images: Joi.array().items(Joi.string()).optional(), // For handling image URLs
  productType: Joi.string().valid("house", "car").required().messages({
    "any.only": 'Product type must be either "house" or "car"',
    "string.empty": "Product type is required",
  }),
});

export const updateProductSchema = Joi.object({
  productName: Joi.string().optional(),
  category: Joi.string().optional(),
  price: Joi.string().optional(),
  description: Joi.string().optional(),
  stock: Joi.string().required(),
  image: Joi.array().items(Joi.string()),
});

export const passwordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(), // Ensure password is at least 6 characters
});

export const createAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(), // Minimum 8 characters for the password
});

export const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('car', 'house').required(), // Ensures type is either 'car' or 'house'
});

export const productSchema = Joi.object({
  item_name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().min(0.01).max(1000000).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.array().items(Joi.string().uri()).min(1).max(5),
});

export const wishlistSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
      })
    )
    .min(1)
    .required(),
});

export const userIdSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

// Define the Joi schema for validation
export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\d+$/).min(10).max(15).required(), // Ensure it's a string of digits
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(500).required(),
});

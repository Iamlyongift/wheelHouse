import Joi from "joi";



export const RegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8) // Adjusted minimum length to 8 for better security
    .regex(/^[a-zA-Z0-9!@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/?]{8,30}$/) // Updated regex to include special characters
    .required(),
  confirm_password: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .label('confirm_password')
    .messages({ 'any.only': '{{#label}} does not match' }),
  phone_number: Joi.string().min(7).max(15).required(), // Adjusted length based on common phone number formats
  country: Joi.string().required(),
  profile_photo: Joi.string().uri(), // Assuming profile_photo is a URL; adjust if needed
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
});

export const creatProductSchema = Joi.object({
  item_name: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  stock: Joi.number().required(),
  images: Joi.array().items(Joi.string()),
});

export const updateProductSchema = Joi.object({
  item_name: Joi.string().optional(),
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
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).optional(),
});
export const productSchema = Joi.object({
  item_name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().min(0.01).max(1000000).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.array().items(Joi.string().uri()).min(1).max(5),
});

export const orderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
        quantity: Joi.number().integer().positive().required(),
      })
    )
    .min(1)
    .max(10)
    .required(),
  shippingDetails: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
});

export const updateOrderSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected"),
});

export const verifyPaymentSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
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

export const cartSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

export const orderHistorySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected", "paid")
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const userIdSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

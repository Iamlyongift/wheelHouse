"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSchema = exports.orderHistorySchema = exports.cartSchema = exports.wishlistSchema = exports.verifyPaymentSchema = exports.updateOrderSchema = exports.orderSchema = exports.productSchema = exports.categorySchema = exports.createAdminSchema = exports.passwordSchema = exports.updateProductSchema = exports.creatProductSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.adminLoginSchema = exports.adminRegistrationSchema = exports.option = exports.LoginSchema = exports.RegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.RegisterSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string()
        .min(6)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    confirm_password: joi_1.default.string()
        .valid(joi_1.default.ref("password"))
        .required()
        .label("confirm_password")
        .messages({ "any.only": "{{#label}} does not match" }),
    phone_number: joi_1.default.string().required(),
    country: joi_1.default.string().required(),
    profile_photo: joi_1.default.string(),
});
exports.LoginSchema = joi_1.default.object({
    email: joi_1.default.string().required(),
    password: joi_1.default.string()
        .min(6)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
});
exports.option = {
    abortearly: false,
    errors: {
        wrap: {
            label: "",
        },
    },
};
exports.adminRegistrationSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
    adminKey: joi_1.default.string().required(),
});
exports.adminLoginSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required(),
    confirmPassword: joi_1.default.string().min(6).required(),
});
exports.updateProfileSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30).optional(),
});
exports.creatProductSchema = joi_1.default.object({
    item_name: joi_1.default.string().required(),
    category: joi_1.default.string().required(),
    price: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    stock: joi_1.default.number().required(),
    image: joi_1.default.array().items(joi_1.default.string()),
});
exports.updateProductSchema = joi_1.default.object({
    item_name: joi_1.default.string().optional(),
    category: joi_1.default.string().optional(),
    price: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    stock: joi_1.default.string().required(),
    image: joi_1.default.array().items(joi_1.default.string()),
});
exports.passwordSchema = joi_1.default.object({
    newPassword: joi_1.default.string().min(6).required(),
});
exports.createAdminSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});
exports.categorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().min(10).max(1000).optional(),
});
exports.productSchema = joi_1.default.object({
    item_name: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().min(10).max(1000).required(),
    price: joi_1.default.number().min(0.01).max(1000000).required(),
    stock: joi_1.default.number().integer().min(0).required(),
    image: joi_1.default.array().items(joi_1.default.string().uri()).min(1).max(5),
});
exports.orderSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    items: joi_1.default.array()
        .items(joi_1.default.object({
        product: joi_1.default.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
        quantity: joi_1.default.number().integer().positive().required(),
    }))
        .min(1)
        .max(10)
        .required(),
    shippingDetails: joi_1.default.object({
        name: joi_1.default.string().required(),
        address: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        country: joi_1.default.string().required(),
        postalCode: joi_1.default.string().required(),
    }).required(),
});
exports.updateOrderSchema = joi_1.default.object({
    status: joi_1.default.string().valid("pending", "approved", "rejected"),
});
exports.verifyPaymentSchema = joi_1.default.object({
    status: joi_1.default.string().valid("approved", "rejected").required(),
});
exports.wishlistSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    items: joi_1.default.array()
        .items(joi_1.default.object({
        product: joi_1.default.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
    }))
        .min(1)
        .required(),
});
exports.cartSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    items: joi_1.default.array()
        .items(joi_1.default.object({
        product: joi_1.default.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
        quantity: joi_1.default.number().min(1).required(),
    }))
        .min(1)
        .required(),
});
exports.orderHistorySchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("pending", "approved", "rejected", "paid")
        .optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional(),
});
exports.userIdSchema = joi_1.default.object({
    userId: joi_1.default.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
});

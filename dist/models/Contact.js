"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProductSchema = new Schema({
    productName: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
}, { timestamps: true });
const ProductModel = mongoose.model("Product", ProductSchema);
exports.default = ProductModel;

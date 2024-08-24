"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const productController_1 = require("../controllers/productController");
const UploadImages_1 = require("../library/helpers/UploadImages");
const router = express_1.default.Router();
router.use(Auth_1.auth, Auth_1.requireAdmin);
router.post("/createproduct", UploadImages_1.upload.array("images", 5), productController_1.createProduct);
router.put("/updateProduct/:id", productController_1.updateProduct);
router.get("/getAllProduct", productController_1.getAllProducts);
router.get("/getSingleProduct/:id", productController_1.getSingleProduct);
router.delete("/deleteProduct/:id", productController_1.deleteProduct);
exports.default = router;

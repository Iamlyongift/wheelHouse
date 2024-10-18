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
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const productController_1 = require("../controllers/productController");
const UploadImages_1 = require("../library/helpers/UploadImages");
const adminCategoryController_1 = require("../controllers/adminCategoryController");
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const router = express_1.default.Router();
const app = (0, express_1.default)();
router.get("/houses", productController_1.getHouses);
router.get("/cars", productController_1.getCars);
router.get("/getSingleProduct/:id", productController_1.getSingleProduct);
router.use(Auth_1.auth, Auth_1.requireAdmin);
router.post("/createproduct", UploadImages_1.upload.array("images", 5), productController_1.createProduct);
router.put("/updateProduct/:id", productController_1.updateProduct);
router.get("/getAllProduct", productController_1.getAllProducts);
router.delete("/deleteProduct/:id", productController_1.deleteProduct);
app.get("/product/getAllProduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productCount = yield ProductModel_1.default.countDocuments();
        res.json({ count: productCount });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching product count" });
    }
}));
router.get("/contact/messages", adminCategoryController_1.getAllMessages);
exports.default = router;

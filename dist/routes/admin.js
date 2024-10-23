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
const adminController_1 = require("../controllers/adminController");
const Auth_1 = require("../middleware/Auth");
const ContactModel_1 = __importDefault(require("../models/ContactModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const CategoryModel_1 = __importDefault(require("../models/CategoryModel"));
const router = express_1.default.Router();
router.post("/adminReg", adminController_1.adminRegister);
router.post("/adminLogin", adminController_1.adminLogin);
const app = (0, express_1.default)();
router.use(Auth_1.auth, Auth_1.requireAdmin);
const adminController_2 = require("../controllers/adminController");
router.get("/users", adminController_2.getAllUsers);
router.put("/users/:userId", adminController_2.updateUser);
router.patch("/users/:userId/toggle-status", adminController_1.toggleUserStatus);
router.patch("/users/:userId/reset-password", adminController_2.resetUserPassword);
router.post("/creatAdmin", adminController_2.createAdminUser);
router.patch("/users/:userId/assign-role", adminController_2.assignAdminRole);
const adminCategoryController_1 = require("../controllers/adminCategoryController");
const UploadImages_1 = require("../library/helpers/UploadImages");
router.post("/categories", adminCategoryController_1.createCategory);
router.put("/categories/:categoryId", adminCategoryController_1.updateCategory);
router.get("/categories/:type", adminCategoryController_1.getCategoriesByType);
router.get("/profile/:adminId", adminController_1.getAdminProfile);
router.delete("/categories/:categoryId", adminCategoryController_1.deleteCategory);
router.get("/getcategories", adminCategoryController_1.getCategory);
router.post("/send-email", UploadImages_1.upload.single("image"), adminController_1.sendEmailToUsers);
app.get("/admin/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userCount = yield UserModel_1.default.countDocuments();
        res.json({ count: userCount });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user count" });
    }
}));
app.get("/admin/getcategories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryCount = yield CategoryModel_1.default.countDocuments();
        res.json({ count: categoryCount });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching category count" });
    }
}));
app.get("/feedback/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedbackCount = yield ContactModel_1.default.countDocuments();
        res.json({ count: feedbackCount });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching feedback count" });
    }
}));
exports.default = router;

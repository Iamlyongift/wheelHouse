"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const payment_1 = require("../controllers/payment");
const UploadImages_1 = require("../library/helpers/UploadImages");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.use(Auth_1.auth);
router.get("/bank-details/:orderId", payment_1.bankDetail);
router.post("/upload-proof/:orderId", UploadImages_1.upload.single("image"), userController_1.uploadProof);
exports.default = router;

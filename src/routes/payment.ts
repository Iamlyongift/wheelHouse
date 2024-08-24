import express from "express";
import { auth } from "../middleware/Auth";
import { bankDetail } from "../controllers/payment";
import { upload } from "../library/helpers/UploadImages";
import { uploadProof } from "../controllers/userController";

const router = express.Router();

router.use(auth);
router.get("/bank-details/:orderId", bankDetail);
router.post("/upload-proof/:orderId", upload.single("image"), uploadProof);

export default router;

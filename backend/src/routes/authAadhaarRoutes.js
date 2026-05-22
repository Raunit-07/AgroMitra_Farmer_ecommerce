import express from "express";
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
} from "../controllers/authAadhaarController.js";

const router = express.Router();

router.post("/send-aadhaar-otp", sendAadhaarOtp);
router.post("/verify-aadhaar-otp", verifyAadhaarOtp);

export default router;

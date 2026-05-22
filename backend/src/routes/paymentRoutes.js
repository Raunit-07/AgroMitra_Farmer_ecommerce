import express from "express";
import {
  createPayment,
  verifyPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// router.post("/create", protect, createPayment);
// router.post("/verify", protect, verifyPayment);
router.post("/create", protect, authorizeRoles("buyer"), createPayment);
router.post("/verify", protect, authorizeRoles("buyer"), verifyPayment);



export default router;

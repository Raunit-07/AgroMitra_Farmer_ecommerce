import express from "express";
import {
  placeOrder,
  getOrders,
  trackOrder,
  updatePaymentStatus
} from "../controllers/orderController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/", protect, getOrders);
router.get("/track/:id", optionalProtect, trackOrder); // Public route with optional auth for owner details
router.patch("/:orderId/payment-status", protect, updatePaymentStatus);

export default router;

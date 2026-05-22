import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("buyer"), getCart);
router.post("/", protect, authorizeRoles("buyer"), addToCart);
router.delete("/", protect, removeFromCart);

export default router;

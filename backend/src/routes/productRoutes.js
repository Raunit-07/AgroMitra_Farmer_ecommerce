import express from "express";
import { addProduct, getProducts, getProductById } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Public route
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected + Farmer only + Image upload
router.post(
  "/",
  protect,
  authorizeRoles("seller"),
  upload.single("image"),
  addProduct
);

export default router;

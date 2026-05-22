import express from "express";
import { upload } from "../config/multer.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(201).json({
    path: `/uploads/${req.file.filename}`,
    publicUrl: `/uploads/${req.file.filename}`,
  });
});

export default router;

import express from "express";
import { verifyGst } from "../controllers/authGstController.js";

const router = express.Router();

router.post("/verify-gst", verifyGst);

export default router;

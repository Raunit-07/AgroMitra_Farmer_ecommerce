import express from "express";
import { runDataOperation } from "../controllers/dataController.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:table", optionalProtect, runDataOperation);

export default router;

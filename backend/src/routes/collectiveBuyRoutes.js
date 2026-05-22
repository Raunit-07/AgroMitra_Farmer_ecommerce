import express from "express";
import {
  joinCollectiveBuy,
  listCollectiveBuys,
  listMySellerCollectiveBuys,
  updateCollectiveBuyDeal,
} from "../controllers/collectiveBuyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listCollectiveBuys);
router.get("/seller/mine", protect, authorizeRoles("seller"), listMySellerCollectiveBuys);
router.post("/join", protect, authorizeRoles("buyer"), joinCollectiveBuy);
router.patch("/:id", protect, authorizeRoles("seller"), updateCollectiveBuyDeal);

export default router;

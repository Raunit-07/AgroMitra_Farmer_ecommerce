import express from "express";
import {
  googleLogin,
  loginUser,
  registerSeller,
  registerUser,
  confirmPasswordReset,
  requestPasswordReset,
  showPasswordResetForm,
  submitPasswordResetForm,
  updatePassword,
  verifyOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

router.post("/register", registerUser);
router.post("/register-seller", registerSeller); 
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/password-reset/request", requestPasswordReset);
router.get("/password-reset/form", showPasswordResetForm);
router.post("/password-reset/submit", submitPasswordResetForm);
router.patch("/password-reset/confirm", confirmPasswordReset);
router.patch("/password", protect, updatePassword);



export default router;

import express from 'express'
import {
  sendRegisterOtp,
  verifyRegisterOtp,
  saveLoginLog,
} from '../controllers/authOtpController.js'
import { verifyGst } from '../controllers/authGstController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Current frontend endpoints
router.post('/register/send-otp', sendRegisterOtp)
router.post('/register/verify-otp', verifyRegisterOtp)

// Compatibility endpoints for older frontend code
router.post('/send-otp', sendRegisterOtp)
router.post('/verify-otp', verifyRegisterOtp)

// GST endpoint also mounted here so /api/auth/seller/verify-gst always works
router.post('/seller/verify-gst', verifyGst)

router.post('/login-log', protect, saveLoginLog)

export default router

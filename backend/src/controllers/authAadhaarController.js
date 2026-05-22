import AadhaarVerification from "../models/AadhaarVerification.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendAadhaarOtp(req, res) {
  try {
    const { email, phone, aadhaar_number } = req.body;

    if (!email || !phone || !aadhaar_number) {
      return res.status(400).json({ message: "Email, phone, and Aadhaar number are required" });
    }

    if (!/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({ message: "Aadhaar number must be 12 digits" });
    }

    const otp = generateOtp();

    await AadhaarVerification.create({
      email: email.trim().toLowerCase(),
      phone,
      aadhaar_last4: aadhaar_number.slice(-4),
      otp_code: otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_verified: false,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[MOCK SMS] To: ${phone}`);
      console.log(`[MOCK SMS] OTP: ${otp}`);
    }

    return res.json({ message: "Aadhaar OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Aadhaar OTP send failed" });
  }
}

export async function verifyAadhaarOtp(req, res) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const otpRecord = await AadhaarVerification.findOne({
      phone,
      otp_code: otp,
      is_verified: false,
    }).sort({ created_at: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expires_at < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    otpRecord.is_verified = true;
    await otpRecord.save();

    return res.json({
      message: "Aadhaar OTP verified successfully",
      aadhaar_last4: otpRecord.aadhaar_last4,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Aadhaar OTP verification failed" });
  }
}

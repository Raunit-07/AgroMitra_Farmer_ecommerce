import { sendMail } from "../config/mailer.js";

export const sendEmail = async (email, otp) => {
  try {
    const info = await sendMail({
      to: email,
      subject: "AgroMitra OTP Verification",
      text: `Your AgroMitra OTP is ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>AgroMitra OTP Verification</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="letter-spacing: 5px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed actual error:", error);
    throw new Error(error.message || "Failed to send OTP email");
  }
};

export const sendOtpEmail = sendEmail;
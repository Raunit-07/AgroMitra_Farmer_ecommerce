import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp_code: { type: String, required: true },
    purpose: { type: String, default: "register" },
    expires_at: Date,
    is_used: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

otpVerificationSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("OtpVerification", otpVerificationSchema);

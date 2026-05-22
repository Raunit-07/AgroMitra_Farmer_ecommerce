import mongoose from "mongoose";

const aadhaarVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    aadhaar_last4: String,
    otp_code: String,
    expires_at: Date,
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

aadhaarVerificationSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("AadhaarVerification", aadhaarVerificationSchema);

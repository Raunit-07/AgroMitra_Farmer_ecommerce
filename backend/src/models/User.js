import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    full_name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: String,
    role: { type: String, enum: ["buyer", "farmer", "seller", "both", "admin"], default: "buyer" },
    phone: String,
    avatar: String,
    is_verified: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    gst_number: String,
    gst_verified: { type: Boolean, default: false },
    business_name: String,
    aadhaar_last4: String,
    password_reset_token: String,
    password_reset_expires: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

userSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    full_name: String,
    phone: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
    is_default: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

addressSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("Address", addressSchema);

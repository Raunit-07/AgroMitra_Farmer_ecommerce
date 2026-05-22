import mongoose from "mongoose";

const sellerAccountSchema = new mongoose.Schema(
  {
    seller_name: String,
    email: String,
    phone: String,
    address: String,
    shop_name: String,
    bank_account_number: String,
    ifsc_code: String,
    upi_id: String,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

sellerAccountSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("SellerAccount", sellerAccountSchema);

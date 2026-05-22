import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: String,
    slug: { type: String, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: String,
    image_url: String,
    category: String,
    category_id: String,
    unit: { type: String, default: "kg" },
    stock: { type: Number, default: 0 },
    stock_quantity: { type: Number, default: 0 },
    min_order_quantity: { type: Number, default: 1 },
    sellerId: String,
    farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    is_active: { type: Boolean, default: true },
    is_approved: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

productSchema.virtual("id").get(function () {
  return this._id.toString();
});

productSchema.pre("save", function (next) {
  if (!this.title) this.title = this.name;
  if (!this.image && this.image_url) this.image = this.image_url;
  if (!this.image_url && this.image) this.image_url = this.image;
  if (!this.stock && this.stock_quantity) this.stock = this.stock_quantity;
  if (!this.stock_quantity && this.stock) this.stock_quantity = this.stock;
  next();
});

export default mongoose.model("Product", productSchema);

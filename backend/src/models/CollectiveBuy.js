import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: String,
    quantity: { type: Number, required: true, min: 1 },
    area: { type: String, required: true, trim: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const collectiveBuySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sellerId: String,
    area: { type: String, required: true, trim: true },
    targetQuantity: { type: Number, default: 10, min: 1 },
    totalQuantity: { type: Number, default: 0, min: 0 },
    dealPrice: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["open", "deal_ready", "closed"],
      default: "open",
    },
    participants: [participantSchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

collectiveBuySchema.index({ productId: 1, area: 1, status: 1 });
collectiveBuySchema.index({ sellerId: 1, status: 1 });

collectiveBuySchema.virtual("id").get(function () {
  return this._id.toString();
});

collectiveBuySchema.pre("save", function (next) {
  this.totalQuantity = this.participants.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  if (this.status !== "closed") {
    this.status = this.totalQuantity >= this.targetQuantity ? "deal_ready" : "open";
  }

  next();
});

export default mongoose.model("CollectiveBuy", collectiveBuySchema);

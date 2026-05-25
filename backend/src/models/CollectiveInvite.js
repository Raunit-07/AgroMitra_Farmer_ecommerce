import mongoose from "mongoose";

const collectiveInviteSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CollectiveSession" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

collectiveInviteSchema.index(
  { senderId: 1, receiverId: 1, productId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
collectiveInviteSchema.index({ receiverId: 1, status: 1, expiresAt: 1 });

collectiveInviteSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("CollectiveInvite", collectiveInviteSchema);

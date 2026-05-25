import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    relatedInviteId: { type: mongoose.Schema.Types.ObjectId, ref: "CollectiveInvite" },
    relatedSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CollectiveSession" },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, created_at: -1 });

notificationSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("Notification", notificationSchema);

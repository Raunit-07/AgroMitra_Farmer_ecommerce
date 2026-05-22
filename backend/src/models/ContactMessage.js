import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

contactMessageSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("ContactMessage", contactMessageSchema);

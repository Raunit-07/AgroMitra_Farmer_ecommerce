import User from "../models/User.js";

export const getProfile = async (req, res) => {
  res.json({ profile: req.user });
};

export const updateProfile = async (req, res) => {
  const allowed = ["name", "full_name", "phone", "avatar", "business_name", "gst_number"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-password");

  res.json({ profile: user });
};

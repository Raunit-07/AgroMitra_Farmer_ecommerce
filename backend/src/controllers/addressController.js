import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user_id: req.user.id }).sort({ is_default: -1, created_at: -1 });
  res.json({ addresses });
};

export const createAddress = async (req, res) => {
  if (req.body.is_default) {
    await Address.updateMany({ user_id: req.user.id }, { is_default: false });
  }

  const address = await Address.create({
    ...req.body,
    user_id: req.user.id,
  });

  res.status(201).json({ address });
};

export const updateAddress = async (req, res) => {
  if (req.body.is_default) {
    await Address.updateMany({ user_id: req.user.id }, { is_default: false });
  }

  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    req.body,
    { new: true }
  );

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  res.json({ address });
};

export const deleteAddress = async (req, res) => {
  await Address.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.json({ message: "Address deleted" });
};

export const setDefaultAddress = async (req, res) => {
  await Address.updateMany({ user_id: req.user.id }, { is_default: false });
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    { is_default: true },
    { new: true }
  );

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  res.json({ address });
};

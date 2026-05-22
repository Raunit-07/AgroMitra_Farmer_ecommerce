import CollectiveBuy from "../models/CollectiveBuy.js";
import Product from "../models/Product.js";

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const shapeCollectiveBuy = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id?.toString?.() || obj.id;
  obj.product_id = obj.productId?._id?.toString?.() || obj.productId?.toString?.() || obj.productId;
  obj.product = obj.productId && typeof obj.productId === "object" ? obj.productId : null;
  obj.seller_id = obj.sellerId;
  return obj;
};

export const listCollectiveBuys = async (req, res) => {
  try {
    const query = {};

    if (req.query.productId) query.productId = req.query.productId;
    if (req.query.area) query.area = new RegExp(`^${escapeRegex(req.query.area.trim())}$`, "i");
    if (req.query.status) query.status = req.query.status;
    if (req.query.sellerId) query.sellerId = req.query.sellerId;

    const groups = await CollectiveBuy.find(query)
      .populate("productId")
      .sort({ updated_at: -1 });

    return res.json({
      success: true,
      collectiveBuys: groups.map(shapeCollectiveBuy),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMySellerCollectiveBuys = async (req, res) => {
  try {
    const groups = await CollectiveBuy.find({ sellerId: req.user.id })
      .populate("productId")
      .sort({ updated_at: -1 });

    return res.json({
      success: true,
      collectiveBuys: groups.map(shapeCollectiveBuy),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const joinCollectiveBuy = async (req, res) => {
  try {
    const { productId, product_id, area, quantity, targetQuantity } = req.body;
    const normalizedProductId = productId || product_id;
    const normalizedArea = String(area || "").trim();
    const qty = Number(quantity);

    if (!normalizedProductId || !normalizedArea || !qty || qty <= 0) {
      return res.status(400).json({
        message: "Product, area, and valid quantity are required",
      });
    }

    const product = await Product.findById(normalizedProductId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let group = await CollectiveBuy.findOne({
      productId: product._id,
      area: new RegExp(`^${escapeRegex(normalizedArea)}$`, "i"),
      status: { $ne: "closed" },
    });

    if (!group) {
      group = new CollectiveBuy({
        productId: product._id,
        productName: product.name || product.title,
        sellerId: product.sellerId || product.farmer_id?.toString?.() || "",
        area: normalizedArea,
        targetQuantity: Number(targetQuantity || product.min_order_quantity || 10),
        dealPrice: Number(product.price || 0) > 0 ? Math.round(Number(product.price) * 0.9) : 0,
        participants: [],
      });
    }

    const existing = group.participants.find(
      (participant) => participant.buyerId.toString() === req.user.id
    );

    if (existing) {
      existing.quantity += qty;
      existing.area = normalizedArea;
      existing.joinedAt = new Date();
    } else {
      group.participants.push({
        buyerId: req.user.id,
        buyerName: req.user.name || req.user.full_name || req.user.email,
        quantity: qty,
        area: normalizedArea,
      });
    }

    await group.save();
    await group.populate("productId");

    return res.status(201).json({
      success: true,
      message: "Collective buying request joined successfully",
      collectiveBuy: shapeCollectiveBuy(group),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCollectiveBuyDeal = async (req, res) => {
  try {
    const { dealPrice, status } = req.body;
    const group = await CollectiveBuy.findOne({
      _id: req.params.id,
      sellerId: req.user.id,
    });

    if (!group) {
      return res.status(404).json({ message: "Collective buying group not found" });
    }

    if (dealPrice !== undefined) group.dealPrice = Number(dealPrice);
    if (status) group.status = status;

    await group.save();
    await group.populate("productId");

    return res.json({
      success: true,
      collectiveBuy: shapeCollectiveBuy(group),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

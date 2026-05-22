import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const shapeCartItem = (item) => ({
  id: item.id,
  quantity: item.quantity,
  product_id: item.productId?.id || item.productId?._id?.toString() || item.productId,
  products: item.productId,
});

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { productId, product_id, quantity } = req.body;
    productId = productId || product_id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "productId and quantity required" });
    }

    const qtyNum = Number.parseInt(quantity, 10);
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = await Cart.findOne({ userId, productId });
    if (existingItem) {
      existingItem.quantity += qtyNum;
      await existingItem.save();
    } else {
      await Cart.create({ userId, productId, quantity: qtyNum });
    }

    return res.json({ message: "Added to cart successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id }).populate("productId");

    return res.json({
      cart: cartItems.map(shapeCartItem),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.body.product_id || req.params.productId;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    await Cart.deleteOne({ userId: req.user.id, productId });

    return res.json({ message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

import Product from "../models/Product.js";
import { ensureDefaultProducts } from "../utils/defaultProducts.js";

const buildSlug = (name) =>
  `${name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now()}`;

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      price,
      description,
      category,
      category_id,
      unit,
      stock,
      stock_quantity,
      min_order_quantity,
      image,
      image_url,
    } = req.body;

    const productName = name || title;
    if (!productName || price === undefined) {
      return res.status(400).json({ message: "Product name and price are required" });
    }

    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({
      name: productName,
      title: productName,
      slug: buildSlug(productName),
      price: Number(price),
      description: description || "",
      category: category || category_id || "",
      category_id: category_id || category || "",
      unit: unit || "kg",
      stock: Number(stock ?? stock_quantity ?? 0),
      stock_quantity: Number(stock_quantity ?? stock ?? 0),
      min_order_quantity: Number(min_order_quantity || 1),
      image: uploadedImage || image || image_url || "",
      image_url: uploadedImage || image_url || image || "",
      sellerId: req.user.id,
      farmer_id: req.user.id,
      is_active: true,
      is_approved: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({ message: "Server error while adding product" });
  }
};

export const getProducts = async (req, res) => {
  try {
    await ensureDefaultProducts(Product);

    const query = { is_active: true };
    if (req.query.category || req.query.categorySlug) {
      query.$or = [
        { category: req.query.category || req.query.categorySlug },
        { category_id: req.query.category || req.query.categorySlug },
      ];
    }

    const products = await Product.find(query).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(404).json({ message: "Product not found", error: error.message });
  }
};

import mongoose from "mongoose";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import ContactMessage from "../models/ContactMessage.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import SellerAccount from "../models/SellerAccount.js";
import User from "../models/User.js";
import { ensureDefaultProducts } from "../utils/defaultProducts.js";

const tableModels = {
  addresses: Address,
  cart: Cart,
  contact_messages: ContactMessage,
  orders: Order,
  products: Product,
  profiles: User,
  seller_account: SellerAccount,
};

const objectIdFields = new Set([
  "id",
  "_id",
  "user_id",
  "userId",
  "buyer_id",
  "farmer_id",
  "product_id",
  "productId",
  "seller_id",
]);

const getModel = (table) => tableModels[table];

const normalizeId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(String(value))) return value;
  return new mongoose.Types.ObjectId(String(value));
};

const normalizeField = (field, table) => {
  if (field === "id") return "_id";

  if (table === "cart") {
    if (field === "product_id") return "productId";
    if (field === "user_id") return "userId";
  }

  if (table === "products" && field === "seller_id") return "sellerId";

  return field;
};

const normalizeValue = (field, value, table) => {
  const normalizedField = normalizeField(field, table);

  if (normalizedField === "sellerId") return String(value);

  if (objectIdFields.has(field) || objectIdFields.has(normalizedField)) {
    return normalizeId(value);
  }

  return value;
};

const applyFilters = (table, filters = []) => {
  const query = {};

  for (const filter of filters) {
    const field = normalizeField(filter.field, table);
    query[field] = normalizeValue(filter.field, filter.value, table);
  }

  return query;
};

const parseOrFilters = (table, orExpression = "") =>
  String(orExpression)
    .split(",")
    .map((part) => {
      const [field, operator, ...rest] = part.split(".");
      if (operator !== "eq") return null;

      return {
        [normalizeField(field, table)]: normalizeValue(field, rest.join("."), table),
      };
    })
    .filter(Boolean);

const normalizeRecord = (table, record = {}, req) => {
  const next = { ...record };

  if (next.id && !next._id) next._id = normalizeId(next.id);
  delete next.id;

  if (table === "cart") {
    next.userId = normalizeValue(
      "user_id",
      next.user_id || next.userId || req.user?.id,
      table
    );

    next.productId = normalizeValue(
      "product_id",
      next.product_id || next.productId,
      table
    );

    next.quantity = Math.max(1, Number(next.quantity || 1));

    delete next.user_id;
    delete next.product_id;
  }

  if (table === "products") {
    next.sellerId = next.sellerId || next.seller_id || req.user?.id;
    next.farmer_id = normalizeValue("farmer_id", next.farmer_id || req.user?.id, table);

    delete next.seller_id;

    if (!next.title && next.name) next.title = next.name;
    if (!next.name && next.title) next.name = next.title;

    if (!next.image && next.image_url) next.image = next.image_url;
    if (!next.image_url && next.image) next.image_url = next.image;

    if (!next.stock && next.stock_quantity) next.stock = next.stock_quantity;
    if (!next.stock_quantity && next.stock) next.stock_quantity = next.stock;
  }

  if (table === "profiles") {
    next.name = next.name || next.full_name;
    next.full_name = next.full_name || next.name;
  }

  return next;
};

const shapeRecord = (table, doc) => {
  if (!doc) return doc;

  const obj = doc.toObject ? doc.toObject() : { ...doc };

  if (table === "cart") {
    const product =
      obj.productId && typeof obj.productId === "object" ? obj.productId : null;

    obj.user_id = obj.userId?.toString?.() || String(obj.userId);

    obj.product_id =
      product?._id?.toString?.() ||
      product?.id ||
      obj.productId?.toString?.() ||
      String(obj.productId);

    obj.productId = product || obj.productId;
    obj.products = product || null;
    obj.quantity = Math.max(1, Number(obj.quantity || 1));

    if (product) {
      obj.product_name = product.name || product.title || obj.product_name;
      obj.name = obj.product_name;
      obj.price = product.price ?? obj.price ?? 0;
      obj.image = product.image || product.image_url || obj.image;
      obj.image_url = product.image_url || product.image || obj.image_url;
      obj.unit = product.unit || obj.unit;
      obj.stock = product.stock ?? product.stock_quantity ?? obj.stock;
    }
  }

  if (table === "products") {
    obj.id = obj._id?.toString?.() || obj.id;
    obj.name = obj.name || obj.title;
    obj.title = obj.title || obj.name;
    obj.image = obj.image || obj.image_url;
    obj.image_url = obj.image_url || obj.image;
    obj.stock = obj.stock ?? obj.stock_quantity;
    obj.stock_quantity = obj.stock_quantity ?? obj.stock;
    obj.seller_id = obj.sellerId || obj.farmer_id?.toString?.();
  }

  if (table === "orders") {
    obj.order_items = obj.order_items || obj.items || [];
    obj.total_amount = obj.total_amount ?? obj.total;
    obj.payment_status = obj.payment_status || obj.paymentStatus;
  }

  if (table === "profiles") {
    delete obj.password;
  }

  return obj;
};

const runPopulate = (table, query) => {
  if (table === "cart") {
    return query.populate({
      path: "productId",
      model: "Product",
    });
  }

  return query;
};

export const runDataOperation = async (req, res) => {
  try {
    const { table } = req.params;
    const Model = getModel(table);

    if (!Model) {
      return res.status(404).json({ message: "Unknown data collection" });
    }

    const {
      filters = [],
      limit,
      op = "select",
      order,
      or,
      single,
      values,
    } = req.body;

    const query = applyFilters(table, filters);
    const orFilters = parseOrFilters(table, or);

    if (orFilters.length) query.$or = orFilters;

    if (op === "insert") {
      const docs = Array.isArray(values) ? values : [values];

      if (table === "cart") {
        const saved = [];

        for (const item of docs) {
          const record = normalizeRecord(table, item, req);

          if (!record.userId || !record.productId) {
            return res.status(400).json({
              data: null,
              error: { message: "userId and productId are required" },
              message: "userId and productId are required",
            });
          }

          const quantityToAdd = Math.max(1, Number(record.quantity || 1));

          const doc = await Cart.findOneAndUpdate(
            {
              userId: record.userId,
              productId: record.productId,
            },
            {
              $inc: { quantity: quantityToAdd },
              $setOnInsert: {
                userId: record.userId,
                productId: record.productId,
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          ).populate({
            path: "productId",
            model: "Product",
          });

          saved.push(shapeRecord(table, doc));
        }

        return res.status(201).json({
          data: single ? saved[0] : saved,
          error: null,
        });
      }

      const created = await Model.create(
        docs.map((item) => normalizeRecord(table, item, req))
      );

      const data = (Array.isArray(created) ? created : [created]).map((doc) =>
        shapeRecord(table, doc)
      );

      return res.status(201).json({
        data: single ? data[0] : data,
        error: null,
      });
    }

    if (op === "upsert") {
      const docs = Array.isArray(values) ? values : [values];
      const saved = [];

      for (const item of docs) {
        const record = normalizeRecord(table, item, req);

        let lookup;

        if (table === "cart") {
          lookup = {
            userId: record.userId,
            productId: record.productId,
          };
        } else {
          lookup = record._id ? { _id: record._id } : { email: record.email };
        }

        const doc = await Model.findOneAndUpdate(lookup, record, {
          new: true,
          setDefaultsOnInsert: true,
          upsert: true,
        });

        saved.push(shapeRecord(table, doc));
      }

      return res.json({
        data: single ? saved[0] : saved,
        error: null,
      });
    }

    if (op === "update") {
      await Model.updateMany(query, normalizeRecord(table, values, req));

      const updated = await runPopulate(table, Model.find(query));
      const data = updated.map((doc) => shapeRecord(table, doc));

      return res.json({
        data: single ? data[0] || null : data,
        error: null,
      });
    }

    if (op === "delete") {
      await Model.deleteMany(query);

      return res.json({
        data: null,
        error: null,
      });
    }

    if (table === "products" && op === "select") {
      await ensureDefaultProducts(Product);
    }

    let dbQuery = runPopulate(table, Model.find(query));

    if (order?.field) {
      dbQuery = dbQuery.sort({
        [normalizeField(order.field, table)]: order.ascending ? 1 : -1,
      });
    }

    if (limit) dbQuery = dbQuery.limit(Number(limit));

    const docs = await dbQuery;
    const data = docs.map((doc) => shapeRecord(table, doc));

    return res.json({
      data: single ? data[0] || null : data,
      error: null,
    });
  } catch (error) {
    console.error("Data operation failed:", error);

    return res.status(500).json({
      data: null,
      error: { message: error.message },
      message: error.message,
    });
  }
};

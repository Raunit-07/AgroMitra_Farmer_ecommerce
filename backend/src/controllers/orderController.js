import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

const shapeOrder = (order) => {
  const obj = order.toObject ? order.toObject() : order;
  obj.order_items = obj.order_items || obj.items || [];
  obj.total_amount = obj.total_amount ?? obj.total;
  obj.payment_status = obj.payment_status || obj.paymentStatus;
  return obj;
};

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId }).populate("productId");

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    const decrementedProducts = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = item.productId;
      if (!product) {
        return res.status(400).json({ message: `Invalid product: ${item.productId}` });
      }

      const quantity = Number(item.quantity || 1);
      const availableStock = Number(product.stock ?? product.stock_quantity ?? 0);

      if (quantity > availableStock) {
        return res.status(400).json({
          message: `${product.name || product.title} has only ${availableStock} item${availableStock === 1 ? "" : "s"} in stock`,
        });
      }

      const price = Number(product.price || 0);
      totalAmount += price * quantity;
      orderItems.push({
        product_id: product.id,
        product_name: product.name || product.title,
        price,
        quantity,
      });
    }

    let address = null;
    if (req.body.address_id) {
      address = await Address.findOne({ _id: req.body.address_id, user_id: userId });
    }

    for (const item of orderItems) {
      const cartProduct = cartItems.find(
        (cartItem) => String(cartItem.productId?._id || cartItem.productId?.id) === String(item.product_id)
      )?.productId;
      const syncedStock = Number(cartProduct?.stock ?? cartProduct?.stock_quantity ?? 0);

      if (Number(cartProduct?.stock_quantity ?? 0) !== syncedStock) {
        await Product.findByIdAndUpdate(item.product_id, {
          $set: { stock_quantity: syncedStock },
        });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product_id,
          stock: { $gte: item.quantity },
          stock_quantity: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
            stock_quantity: -item.quantity,
          },
        },
        { new: true }
      );

      if (!updatedProduct) {
        for (const decremented of decrementedProducts) {
          await Product.findByIdAndUpdate(decremented.productId, {
            $inc: {
              stock: decremented.quantity,
              stock_quantity: decremented.quantity,
            },
          });
        }

        return res.status(400).json({
          message: `${item.product_name} stock changed. Please update your cart and try again.`,
        });
      }

      decrementedProducts.push({ productId: item.product_id, quantity: item.quantity });
    }

    let order;
    try {
      order = await Order.create({
      userId,
      user_id: userId,
      buyer_id: userId,
      items: orderItems,
      order_items: orderItems,
      total: totalAmount,
      total_amount: totalAmount,
      status: "placed",
      payment_method: req.body.payment_method || "COD",
      paymentStatus: "pending",
      payment_status: "pending",
      address_id: req.body.address_id || null,
      address: address ? address.toObject() : req.body.address || null,
      });
    } catch (error) {
      for (const decremented of decrementedProducts) {
        await Product.findByIdAndUpdate(decremented.productId, {
          $inc: {
            stock: decremented.quantity,
            stock_quantity: decremented.quantity,
          },
        });
      }

      throw error;
    }

    await Cart.deleteMany({ userId });

    return res.status(201).json({
      message: "Order placed successfully",
      order: shapeOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ orders: orders.map(shapeOrder) });
  } catch (error) {
    console.error("Get Orders Exception:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found or invalid Order ID" });
    }

    const shapedOrder = shapeOrder(order);
    const isOwner = req.user && req.user.id === String(shapedOrder.buyer_id);
    const fullAddress = shapedOrder.address;
    const deliveryAddress = isOwner
      ? fullAddress
      : {
          city: fullAddress?.city,
          state: fullAddress?.state,
          pincode: fullAddress?.pincode ? `${fullAddress.pincode.substring(0, 3)}***` : null,
          note: "Full address hidden for privacy",
        };

    const statuses = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];
    const statusLabels = {
      placed: "Order Placed",
      processing: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
    };
    const statusDescriptions = {
      placed: "Your order has been placed successfully",
      processing: "Your order has been packed and is ready to ship",
      shipped: "Your order has been shipped",
      out_for_delivery: "Your order is out for delivery",
      delivered: "Your order has been delivered successfully",
    };

    let currentStatusIndex = statuses.indexOf(String(shapedOrder.status || "placed").toLowerCase());
    if (currentStatusIndex === -1) currentStatusIndex = 0;

    const createdDate = new Date(shapedOrder.created_at);
    const timeline = statuses.map((status, index) => ({
      status,
      label: statusLabels[status],
      description: index <= currentStatusIndex ? statusDescriptions[status] : "",
      date: new Date(createdDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString(),
      completed: index <= currentStatusIndex,
    }));

    return res.json({
      orderId: shapedOrder.id,
      orderDate: shapedOrder.created_at,
      paymentMethod: shapedOrder.payment_method === "cod" ? "COD" : shapedOrder.payment_method,
      totalAmount: shapedOrder.total_amount,
      status: shapedOrder.status || "placed",
      deliveryAddress,
      orderItems: shapedOrder.order_items,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transaction_id, payment_method } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction ID required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.buyer_id) !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You do not own this order" });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    order.payment_status = "paid";
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.payment_method = payment_method || "UPI";
    order.transaction_id = transaction_id;
    order.payments.push({
      transaction_id,
      payment_method: payment_method || "UPI",
      payment_status: "paid",
      paid_at: new Date(),
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order: shapeOrder(order),
    });
  } catch (error) {
    console.error("Update Payment Status Exception:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

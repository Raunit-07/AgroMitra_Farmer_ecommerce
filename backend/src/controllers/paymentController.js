import { generateQR } from "../utils/qrGenerator.js";
import { callDeliveryAPI } from "../services/deliveryService.js";
import Order from "../models/Order.js";

export const createPayment = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (String(order.buyer_id || order.userId) !== userId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  if (order.payment_status === "paid") {
    return res.status(400).json({ message: "Already paid" });
  }

  const qr = await generateQR("merchant@upi", order.total_amount || order.total);

  return res.json({
    message: "Scan QR to pay",
    qr,
    amount: order.total_amount || order.total,
  });
};

export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, transactionId } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({ message: "orderId and transactionId required" });
    }

    if (!transactionId.startsWith("TXN")) {
      return res.status(400).json({ message: "Invalid transaction format" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.buyer_id || order.userId) !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({ message: "Already verified" });
    }

    const existingTxn = await Order.findOne({ transaction_id: transactionId });
    if (existingTxn) {
      return res.status(400).json({ message: "Duplicate transaction" });
    }

    order.status = "paid";
    order.payment_status = "paid";
    order.paymentStatus = "paid";
    order.transaction_id = transactionId;
    order.payments.push({
      transaction_id: transactionId,
      payment_method: "UPI",
      payment_status: "paid",
      paid_at: new Date(),
    });
    await order.save();

    await callDeliveryAPI(order);

    return res.json({
      message: "Payment verified & order confirmed",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

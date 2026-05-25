import Notification from "../models/Notification.js";

const shapeNotification = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id?.toString?.() || obj.id;
  obj.user_id = obj.userId?.toString?.() || obj.userId;
  obj.sender = obj.senderId && typeof obj.senderId === "object" ? obj.senderId : null;
  obj.invite = obj.relatedInviteId && typeof obj.relatedInviteId === "object" ? obj.relatedInviteId : null;
  obj.session_id = obj.relatedSessionId?.toString?.() || obj.relatedSessionId;
  return obj;
};

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate("senderId", "name full_name email avatar")
      .populate({
        path: "relatedInviteId",
        populate: { path: "productId", select: "name title image image_url price" },
      })
      .sort({ created_at: -1 })
      .limit(50);

    return res.json({
      success: true,
      notifications: notifications.map(shapeNotification),
      unreadCount: notifications.filter((item) => !item.isRead).length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.json({
      success: true,
      notification: shapeNotification(notification),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

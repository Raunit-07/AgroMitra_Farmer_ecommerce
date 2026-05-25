import { apiRequest } from "../lib/mongoClient";

export const fetchNotifications = () => apiRequest("/notifications");

export const markNotificationRead = (id) =>
  apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  apiRequest("/notifications/read-all", {
    method: "PATCH",
  });

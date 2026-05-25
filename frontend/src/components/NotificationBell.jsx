import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications } from "../services/notificationService";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        if (!localStorage.getItem("token")) return;
        const payload = await fetchNotifications();
        if (isMounted) setUnreadCount(payload.unreadCount || 0);
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    }

    load();
    window.addEventListener("authChange", load);
    window.addEventListener("notificationsUpdated", load);

    const timer = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
      window.removeEventListener("authChange", load);
      window.removeEventListener("notificationsUpdated", load);
    };
  }, []);

  return (
    <Link to="/notifications" className="notification-bell" title="Notifications">
      <span>🔔</span>
      {unreadCount > 0 && <strong>{unreadCount}</strong>}
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  acceptCollectiveInvite,
  rejectCollectiveInvite,
} from "../services/collectiveBuyService";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import "../components/landing.css";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadNotifications() {
    setLoading(true);
    try {
      const payload = await fetchNotifications();
      setNotifications(payload.notifications || []);
    } catch (error) {
      setMessage(error.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  async function handleAccept(notification) {
    const inviteId = notification.relatedInviteId?._id || notification.relatedInviteId || notification.invite?._id;
    if (!inviteId) return;

    try {
      const payload = await acceptCollectiveInvite(inviteId);
      await markNotificationRead(notification.id);
      window.dispatchEvent(new Event("notificationsUpdated"));
      navigate(`/collective/session/${payload.session.id}`);
    } catch (error) {
      setMessage(error.message || "Could not accept invite.");
    }
  }

  async function handleReject(notification) {
    const inviteId = notification.relatedInviteId?._id || notification.relatedInviteId || notification.invite?._id;
    if (!inviteId) return;

    try {
      await rejectCollectiveInvite(inviteId);
      await markNotificationRead(notification.id);
      window.dispatchEvent(new Event("notificationsUpdated"));
      await loadNotifications();
    } catch (error) {
      setMessage(error.message || "Could not reject invite.");
    }
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    window.dispatchEvent(new Event("notificationsUpdated"));
    await loadNotifications();
  }

  if (loading) return <div className="orders-loading">Loading notifications...</div>;

  return (
    <section className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <span>Account</span>
          <h1>Notifications</h1>
          <p>Collective buying invites and updates.</p>
        </div>

        {message && <div className="orders-error">{message}</div>}

        <button className="orders-shop-btn" type="button" onClick={handleReadAll}>
          Mark all as read
        </button>

        {notifications.length === 0 ? (
          <div className="orders-empty">
            <h2>No notifications</h2>
            <p>Invite updates will appear here.</p>
            <Link to="/products" className="orders-shop-btn">Explore Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {notifications.map((notification) => {
              const invite = notification.invite;
              const product = invite?.productId;
              const isInvite =
                notification.type === "collective_invite" &&
                invite?.status === "pending";

              return (
                <div key={notification.id} className={`order-card ${notification.isRead ? "" : "status--pending"}`}>
                  <div className="order-card-top">
                    <div>
                      <strong>{notification.sender?.name || notification.sender?.full_name || notification.sender?.email || "AgroMitra"}</strong>
                      <p>{notification.message}</p>
                      {product && <small>{product.name || product.title}</small>}
                    </div>
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>

                  {isInvite && (
                    <div className="cb-actions">
                      <button type="button" onClick={() => handleAccept(notification)}>Accept</button>
                      <button type="button" className="cb-secondary" onClick={() => handleReject(notification)}>Reject</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

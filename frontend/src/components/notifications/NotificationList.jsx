import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig.js";
import { FiCheck, FiX } from "react-icons/fi";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, response) => {
    try {
      await axios.put(`/notifications/${id}/respond`, { response });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, status: response, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Error responding to notification:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // ✅ Real-time updates (poll every 15s)
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (notifications.length === 0)
    return <p className="empty">No notifications yet.</p>;

  return (
    <div className="notif-list">
      {notifications.map((n) => (
        <div key={n._id} className={`notif-item ${n.isRead ? "read" : ""}`}>
          <p>
            <strong>{n.type.replace("_", " ")}:</strong> {n.message}
          </p>
          {n.status === "Pending" && (
            <div className="notif-actions">
              <button
                className="btn-accept"
                onClick={() => respond(n._id, "Accepted")}
              >
                <FiCheck /> Accept
              </button>
              <button
                className="btn-reject"
                onClick={() => respond(n._id, "Rejected")}
              >
                <FiX /> Reject
              </button>
            </div>
          )}
          {n.status !== "Pending" && (
            <p className={`status-tag ${n.status.toLowerCase()}`}>
              {n.status}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

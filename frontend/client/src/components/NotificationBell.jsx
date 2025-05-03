import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/user-notifications/${userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    for (const id of unreadIds) {
      await axios.post(`http://localhost:8080/api/user-notifications/mark-read`, {
        userId,
        notificationId: id,
      });
    }
    await fetchNotifications(); // Refresh after marking as read
  };

  const handleToggleDropdown = async () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);

    if (!nextState) {
      // If closing the dropdown, mark all visible notifications as read
      await markAllAsRead();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by type (likes, comments, follows)
  const grouped = notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .reduce((acc, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    }, {});

  const sectionTitle = {
    like: "Likes",
    comment: "Comments",
    follow: "Follows",
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="relative text-xl"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl z-50 max-h-[30rem] overflow-y-auto border border-gray-200">
          <div className="p-4 font-bold border-b text-lg">Notifications</div>

          {Object.keys(grouped).length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="p-2">
                <h4 className="text-xs uppercase tracking-wide text-gray-400 px-2 mb-1">
                  {sectionTitle[type]}
                </h4>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 mb-2 rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <img
                      src={n.image || `https://i.pravatar.cc/150?u=${n.id}`}
                      alt="profile"
                      className="w-10 h-10 rounded-full border border-gray-300"
                    />
                    <div className="flex flex-col w-full">
                      <div className="text-sm">{n.message}</div>
                      {n.timestamp && (
                        <div className="text-xs text-gray-500 mt-1">
                          {dayjs(n.timestamp).fromNow()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

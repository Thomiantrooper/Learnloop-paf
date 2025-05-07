<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
dayjs.extend(relativeTime);

// Custom SVG Icons
const BellIcon = ({ hasUnread }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={hasUnread ? "#3b82f6" : "#6b7280"} 
    strokeWidth="2"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    {hasUnread && (
      <circle cx="18" cy="8" r="3" fill="#ef4444" stroke="none" />
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563">
    <path d="M20 6L9 17l-5-5" strokeWidth="2" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563">
    <path d="M18 6L6 18" strokeWidth="2" />
    <path d="M6 6l12 12" strokeWidth="2" />
  </svg>
);

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user-notifications/${userId}`
      );
      setNotifications(res.data || []);
      
      // Check if there are new notifications since last fetch
      const hasUnread = res.data.some(n => !n.read);
      setHasNewNotifications(hasUnread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(
        unreadIds.map((id) =>
          axios.post(`http://localhost:8080/api/user-notifications/mark-read`, {
            userId,
            notificationId: id,
          })
        )
      );
      await fetchNotifications();
      setHasNewNotifications(false);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
>>>>>>> master
  };

  const handleToggleDropdown = async () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);

<<<<<<< HEAD
    if (!nextState) {
      // If closing the dropdown, mark all visible notifications as read
=======
    if (nextState && hasNewNotifications) {
>>>>>>> master
      await markAllAsRead();
    }
  };

<<<<<<< HEAD
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by type (likes, comments, follows)
  const grouped = notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
=======
  const clearAllNotifications = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/user-notifications/clear-all`, {
        data: { userId }
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by type
  const grouped = notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15)
>>>>>>> master
    .reduce((acc, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    }, {});

  const sectionTitle = {
    like: "Likes",
    comment: "Comments",
<<<<<<< HEAD
    follow: "Follows",
=======
    follow: "New Followers",
    mention: "Mentions",
    system: "System Updates",
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: { emoji: "❤️", color: "from-red-100 to-pink-100" },
      comment: { emoji: "💬", color: "from-blue-100 to-cyan-100" },
      follow: { emoji: "👤", color: "from-purple-100 to-indigo-100" },
      mention: { emoji: "📌", color: "from-amber-100 to-yellow-100" },
      default: { emoji: "ℹ️", color: "from-gray-100 to-gray-200" }
    };
    
    return icons[type] || icons.default;
>>>>>>> master
  };

  return (
    <div className="relative">
      <button
<<<<<<< HEAD
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
=======
        ref={bellRef}
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={showDropdown}
      >
        <BellIcon hasUnread={hasNewNotifications} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-white shadow-xl rounded-lg z-50 max-h-[32rem] overflow-y-auto border border-gray-200"
          >
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center backdrop-blur-sm bg-white/90">
              <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Mark all as read"
                  aria-label="Mark all notifications as read"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Clear all"
                  aria-label="Clear all notifications"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="mt-2 text-gray-700 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  When you get notifications, they'll appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {Object.entries(grouped).map(([type, items]) => {
                  const icon = getNotificationIcon(type);
                  return (
                    <div key={type} className="py-2">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 px-4 py-2">
                        {sectionTitle[type] || type}
                      </h4>
                      {items.map((n) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            !n.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${icon.color} flex items-center justify-center text-lg`}>
                              {icon.emoji}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">
                                {dayjs(n.timestamp).fromNow()}
                              </span>
                              {!n.read && (
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> master
    </div>
  );
};

<<<<<<< HEAD
export default NotificationBell;
=======
export default NotificationBell;
>>>>>>> master

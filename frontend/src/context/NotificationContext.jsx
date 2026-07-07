/**
 * context/NotificationContext.jsx
 * --------------------------------
 * Global notification state.
 * Tracks unread count and notification list for the bell icon in the navbar.
 */

import { createContext, useContext, useState, useCallback } from "react";
import * as notificationService from "../services/notification.service.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationService.getNotifications();
      const items = data.data || [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.isRead).length);
    } catch {
      // Fail silently — non-critical
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    setNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

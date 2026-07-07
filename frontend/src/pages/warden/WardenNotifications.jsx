import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function WardenNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/warden/notifications");
      setNotifications(data.data);
    } catch {
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/warden/notifications/read");
      toast.success("All notifications marked as read.");
      fetchNotifications();
    } catch {
      toast.error("Failed to mark notifications.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated on system activities.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="text-4xl block mb-3">📭</span>
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 flex items-start gap-4 transition-colors ${n.isRead ? 'bg-white' : 'bg-brand-50/50'}`}
              >
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-brand-600'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">{format(new Date(n.createdAt), "MMM d, yyyy h:mm a")}</span>
                    {n.complaintId && (
                      <Link to={`/warden/complaints/${n.complaintId}`} className="text-xs text-brand-600 hover:underline">
                        View Complaint →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

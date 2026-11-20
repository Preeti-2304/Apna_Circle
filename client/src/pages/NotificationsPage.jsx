import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('[Fetch Notifications Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed to mark read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await api.put(`/notifications/${notif._id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on friend requests, messages, help responses, and rewards.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">You're all caught up!</p>
            <p className="text-xs text-slate-500">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                n.read ? 'bg-white hover:bg-slate-50/70' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  n.read ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white shadow-sm'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs ${
                      n.read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 self-center flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

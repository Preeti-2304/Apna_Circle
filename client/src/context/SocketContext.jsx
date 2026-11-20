import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to real-time server');
    });

    newSocket.on('user_status', ({ userId, status }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    // Real-time notifications
    newSocket.on('notification', (notif) => {
      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-semibold text-sm text-slate-900">{notif.title}</p>
              <p className="text-xs text-slate-600">{notif.message}</p>
            </div>
          </div>
        ),
        { duration: 5000, position: 'top-right' }
      );
    });

    newSocket.on('message_notification', ({ message }) => {
      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="font-semibold text-sm text-slate-900">
                {message?.sender?.name || 'New Message'}
              </p>
              <p className="text-xs text-slate-600 line-clamp-1">{message?.text}</p>
            </div>
          </div>
        ),
        { duration: 4000, position: 'bottom-right' }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id]);

  const isUserOnline = (userId) => {
    return onlineUserIds.has(userId);
  };

  return (
    <SocketContext.Provider value={{ socket, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, isUserOnline: () => false };
};

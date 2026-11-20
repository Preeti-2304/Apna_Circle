import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Compass,
  UserPlus,
  Users,
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Globe2,
  Award,
  Bell,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  MapPin,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ requests: 0, notifications: 0, unreadMsgs: 0 });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [reqRes, notifRes, convoRes] = await Promise.allSettled([
          api.get('/friends/requests'),
          api.get('/notifications'),
          api.get('/chat/conversations'),
        ]);

        const requestsCount =
          reqRes.status === 'fulfilled' ? reqRes.value.data.received?.length || 0 : 0;
        const notifCount =
          notifRes.status === 'fulfilled' ? notifRes.value.data.unreadCount || 0 : 0;
        const unreadMsgsCount =
          convoRes.status === 'fulfilled'
            ? convoRes.value.data.conversations?.reduce(
                (sum, c) => sum + (c.unreadCount || 0),
                0
              ) || 0
            : 0;

        setCounts({
          requests: requestsCount,
          notifications: notifCount,
          unreadMsgs: unreadMsgsCount,
        });
      } catch (e) {
        // Silently catch badge errors
      }
    };

    if (user) {
      fetchBadges();
      const interval = setInterval(fetchBadges, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover People', path: '/discover', icon: Compass },
    {
      name: 'Friend Requests',
      path: '/friends/requests',
      icon: UserPlus,
      badge: counts.requests,
    },
    { name: 'My Friends', path: '/friends', icon: Users },
    { name: 'Friends of Friends', path: '/friends/of-friends', icon: Sparkles },
    { name: 'Help Requests', path: '/help-requests', icon: LifeBuoy },
    { name: 'Create Request', path: '/help-requests/create', icon: PlusCircle },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: counts.unreadMsgs,
    },
    { name: 'Communities', path: '/communities', icon: Globe2 },
    { name: 'Rewards & Points', path: '/rewards', icon: Award },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: counts.notifications,
    },
    { name: 'My Profile', path: '/profile/me', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin Panel',
      path: '/admin',
      icon: ShieldAlert,
      badge: 'Admin',
    });
  }

  const closeSidebar = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              ApnaCircle
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>{user?.currentCity || 'Delhi'}</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badge === 'Admin'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between gap-3">
            <div
              onClick={() => {
                navigate('/profile/me');
                closeSidebar();
              }}
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] font-medium text-indigo-600 truncate">
                  Level {user?.level || 1} • {user?.rewardPoints || 0} pts
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

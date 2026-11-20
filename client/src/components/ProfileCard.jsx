import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Award,
  UserPlus,
  MessageSquare,
  Check,
  Clock,
  MoreVertical,
  ShieldAlert,
} from 'lucide-react';

const ProfileCard = ({
  userItem,
  friendshipStatus = 'none', // 'none' | 'pending' | 'friends' | 'received'
  onStatusChange,
}) => {
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOnline = isUserOnline(userItem._id);
  const isSelf = currentUser?._id === userItem._id;

  const handleSendFriendRequest = async () => {
    if (!currentUser) {
      toast.error('Please login to send friend requests');
      navigate('/login');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await api.post(`/friends/request/${userItem._id}`);
      if (res.data.success) {
        toast.success('Friend request sent!');
        if (onStatusChange) onStatusChange(userItem._id, 'pending');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: userItem._id,
      });
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.conversation._id}`);
      }
    } catch (err) {
      toast.error('Could not initiate conversation');
    }
  };

  const handleBlock = async () => {
    if (window.confirm(`Block ${userItem.name}? You will no longer see each other.`)) {
      try {
        await api.post(`/users/${userItem._id}/block`);
        toast.success(`${userItem.name} has been blocked`);
        if (onStatusChange) onStatusChange(userItem._id, 'blocked');
      } catch (e) {
        toast.error('Failed to block user');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Avatar Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={
                  userItem.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={userItem.name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              {isOnline && (
                <span
                  title="Online right now"
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                />
              )}
            </div>

            <div>
              <Link
                to={`/profile/${userItem._id}`}
                className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
              >
                {userItem.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="font-medium text-slate-700">{userItem.currentCity || 'India'}</span>
                {userItem.originallyFrom?.city &&
                  userItem.originallyFrom.city !== userItem.currentCity && (
                    <span className="text-[11px] text-slate-400">
                      (from {userItem.originallyFrom.city})
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Action Menu (Block / Report) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-floating border border-slate-100 py-1 z-20 text-xs">
                <button
                  onClick={handleBlock}
                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Block User
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badges Row: Trust Score & Reward Points */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {userItem.trustScore || 80}% Trust
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
            <Award className="w-3 h-3 text-amber-600" />
            {userItem.rewardPoints || 0} pts
          </span>
          {userItem.availability && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                userItem.availability === 'Available'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {userItem.availability}
            </span>
          )}
        </div>

        {/* Education & Profession */}
        <div className="space-y-1 mb-3 text-xs text-slate-600">
          {userItem.college && (
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{userItem.college}</span>
            </div>
          )}
          {userItem.profession && (
            <div className="flex items-center gap-1.5 truncate">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{userItem.profession}</span>
            </div>
          )}
        </div>

        {/* Bio snippet */}
        {userItem.bio && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {userItem.bio}
          </p>
        )}

        {/* Skills / Can Help With pills */}
        {userItem.canHelpCategories?.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Can Help With:
            </p>
            <div className="flex flex-wrap gap-1">
              {userItem.canHelpCategories.slice(0, 3).map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {cat}
                </span>
              ))}
              {userItem.canHelpCategories.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium self-center">
                  +{userItem.canHelpCategories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/profile/${userItem._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          View Profile
        </Link>

        {!isSelf && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartChat}
              className="p-2 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-all"
              title="Message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {friendshipStatus === 'friends' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                Friends
              </span>
            ) : friendshipStatus === 'pending' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Requested
              </span>
            ) : (
              <button
                onClick={handleSendFriendRequest}
                disabled={loadingAction}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Friend
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;

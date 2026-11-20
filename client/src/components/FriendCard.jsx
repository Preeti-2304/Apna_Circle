import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Award,
  MessageSquare,
  UserX,
  Navigation,
} from 'lucide-react';

const FriendCard = ({ friend, onRemoveFriend }) => {
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);

  const isOnline = isUserOnline(friend._id);

  const handleStartChat = async () => {
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: friend._id,
      });
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      toast.error('Unable to open conversation');
    }
  };

  const handleUnfriend = async () => {
    if (
      window.confirm(
        `Are you sure you want to remove ${friend.name} from your friend circle?`
      )
    ) {
      setIsRemoving(true);
      try {
        const res = await api.delete(`/friends/${friend._id}`);
        if (res.data.success) {
          toast.success(`${friend.name} removed from friends`);
          if (onRemoveFriend) onRemoveFriend(friend._id);
        }
      } catch (err) {
        toast.error('Failed to remove friend');
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative">
            <img
              src={
                friend.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={friend.name}
              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
            {isOnline && (
              <span
                title="Active now"
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${friend._id}`}
              className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
            >
              {friend.name}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="font-semibold text-slate-800">{friend.currentCity}</span>
              {friend.originallyFrom?.city &&
                friend.originallyFrom.city !== friend.currentCity && (
                  <span className="text-[11px] text-slate-400">
                    (from {friend.originallyFrom.city})
                  </span>
                )}
            </div>

            {friend.distanceKm !== undefined && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 mt-1">
                <Navigation className="w-3 h-3" />
                <span>~{friend.distanceKm} km away</span>
              </div>
            )}
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {friend.trustScore || 80}% Trust
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
            <Award className="w-3 h-3 text-amber-600" />
            {friend.rewardPoints || 0} pts
          </span>
          {friend.helpCompletedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
              {friend.helpCompletedCount} helped
            </span>
          )}
        </div>

        {/* Details: College & Profession */}
        <div className="space-y-1 mb-3 text-xs text-slate-600">
          {friend.college && (
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{friend.college}</span>
            </div>
          )}
          {friend.profession && (
            <div className="flex items-center gap-1.5 truncate">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{friend.profession}</span>
            </div>
          )}
        </div>

        {/* Can Help With */}
        {friend.canHelpCategories?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Can Help With:
            </p>
            <div className="flex flex-wrap gap-1">
              {friend.canHelpCategories.slice(0, 3).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handleUnfriend}
          disabled={isRemoving}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Remove</span>
        </button>

        <button
          onClick={handleStartChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-[1.02]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
};

export default FriendCard;

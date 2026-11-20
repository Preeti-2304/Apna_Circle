import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Sparkles, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FriendsOfFriendsPage = () => {
  const [fofList, setFofList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendsOfFriends();
  }, []);

  const fetchFriendsOfFriends = async () => {
    setLoading(true);
    try {
      const res = await api.get('/friends/of-friends');
      if (res.data.success) {
        setFofList(res.data.friendsOfFriends || []);
      }
    } catch (err) {
      console.error('[Friends of friends fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>2nd-Degree Network Discovery</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Friends of Friends
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Discover trusted people who are friends with your direct friends.
          These connections are clearly marked as <strong>Friend of Friend</strong> to maintain distinction from your direct circle.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : fofList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No second-degree connections discovered yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Connect with more friends across cities to expand your mutual friend recommendations.
          </p>
          <div className="pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Discover People
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fofList.map((userItem) => (
            <div key={userItem._id} className="relative">
              {/* Distinct Badge on Top */}
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Friend of Friend
                </span>
                {userItem.mutualFriends?.length > 0 && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Mutual: {userItem.mutualFriends.join(', ')}
                  </span>
                )}
              </div>
              <ProfileCard userItem={userItem} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsOfFriendsPage;

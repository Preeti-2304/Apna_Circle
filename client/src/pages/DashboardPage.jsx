import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import HelpRequestCard from '../components/HelpRequestCard';
import HelperMatchModal from '../components/HelperMatchModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Users,
  MapPin,
  LifeBuoy,
  Award,
  ShieldCheck,
  UserPlus,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle,
  PlusCircle,
  Activity,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFriends: 0,
    pendingRequests: 0,
    openRequests: 0,
    completedRequests: 0,
    nearbyCount: 0,
  });
  const [nearbyPeople, setNearbyPeople] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [selectedRequestForMatches, setSelectedRequestForMatches] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.currentCity]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, helpReqsRes, convoRes, nearbyRes] =
        await Promise.allSettled([
          api.get('/friends'),
          api.get('/friends/requests'),
          api.get('/help-requests?status=Open&limit=4'),
          api.get('/chat/conversations'),
          api.get(`/users/nearby?city=${encodeURIComponent(user?.currentCity || 'Delhi')}&radius=35`),
        ]);

      const totalFriends =
        friendsRes.status === 'fulfilled' ? friendsRes.value.data.total || 0 : 0;
      const pendingRequests =
        requestsRes.status === 'fulfilled' ? requestsRes.value.data.received?.length || 0 : 0;
      const openRequests =
        helpReqsRes.status === 'fulfilled' ? helpReqsRes.value.data.total || 0 : 0;
      const conversations =
        convoRes.status === 'fulfilled' ? convoRes.value.data.conversations?.slice(0, 4) || [] : [];
      const nearbyList =
        nearbyRes.status === 'fulfilled' ? nearbyRes.value.data.users?.slice(0, 4) || [] : [];

      setStats({
        totalFriends,
        pendingRequests,
        openRequests,
        completedRequests: user?.helpCompletedCount || 0,
        nearbyCount: nearbyList.length,
      });

      setNearbyPeople(nearbyList);
      setActiveRequests(helpReqsRes.status === 'fulfilled' ? helpReqsRes.value.data.helpRequests || [] : []);
      setRecentConversations(conversations);
    } catch (err) {
      console.error('[Dashboard fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Status Header Widget */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-indigo-300" />
              <span>Current City: <strong className="text-white">{user?.currentCity || 'Delhi'}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              You are connected in {user?.currentCity || 'your city'}. You have {stats.totalFriends} friends across cities and {stats.nearbyCount} community members nearby.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/help-requests/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-slate-100 shadow-sm transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Ask For Help
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40 rounded-xl transition-all"
            >
              <Compass className="w-4 h-4" />
              Discover People
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">My Friends</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalFriends}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Connected across cities</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Friend Requests</span>
            <UserPlus className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.pendingRequests}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending approval</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600">{user?.trustScore || 80}%</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Verified reputation</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reward Points</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-600">{user?.rewardPoints || 0}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Level {user?.level || 1} Helper</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assistance Done</span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{user?.helpCompletedCount || 0}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">People helped</p>
          </div>
        </div>
      </div>

      {/* 3. People Nearby in Current City */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              People Nearby in {user?.currentCity || 'Your City'}
            </h2>
            <p className="text-xs text-slate-500">
              Community members and friends living or staying near you.
            </p>
          </div>
          <Link
            to={`/discover?city=${encodeURIComponent(user?.currentCity || 'Delhi')}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Nearby</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : nearbyPeople.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-700">
              No people found in {user?.currentCity} yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Be the pioneer in your city or explore people from other cities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nearbyPeople.map((person) => (
              <ProfileCard key={person._id} userItem={person} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Open Help Requests in Your City & Network */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-indigo-600" />
              Open Help Requests
            </h2>
            <p className="text-xs text-slate-500">
              Offer assistance to fellow members and earn reward points!
            </p>
          </div>
          <Link
            to="/help-requests"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Browse All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : activeRequests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-700">No open requests right now</p>
            <Link
              to="/help-requests/create"
              className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Post First Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeRequests.map((req) => (
              <HelpRequestCard
                key={req._id}
                request={req}
                onOpenMatches={(r) => setSelectedRequestForMatches(r)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Recent Conversations Widget */}
      {recentConversations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Recent Conversations
            </h2>
            <Link
              to="/messages"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Open Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentConversations.map((convo) => {
              const other = convo.otherParticipant;
              return (
                <div
                  key={convo._id}
                  onClick={() => navigate(`/messages?conversationId=${convo._id}`)}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:border-indigo-300 cursor-pointer transition-all flex items-center gap-3"
                >
                  <img
                    src={
                      other?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={other?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{other?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Smart Match Modal */}
      {selectedRequestForMatches && (
        <HelperMatchModal
          request={selectedRequestForMatches}
          isOpen={!!selectedRequestForMatches}
          onClose={() => setSelectedRequestForMatches(null)}
          onHelperAccepted={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};

export default DashboardPage;

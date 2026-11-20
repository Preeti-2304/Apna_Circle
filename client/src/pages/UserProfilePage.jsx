import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Award,
  UserPlus,
  MessageSquare,
  Star,
  Flag,
  ArrowLeft,
  Check,
} from 'lucide-react';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');

  const isSelf = currentUser?._id === id;
  const isOnline = isUserOnline(id);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data.success) {
        setProfile(res.data.user);
      }
    } catch (err) {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/user/${id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (e) {
      // Ignore reviews fetch error
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const res = await api.post(`/friends/request/${id}`);
      if (res.data.success) {
        toast.success('Friend request sent!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await api.post('/chat/conversations', { recipientId: id });
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.conversation._id}`);
      }
    } catch (err) {
      toast.error('Failed to open chat');
    }
  };

  const handleReportUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/reports', {
        reportedUserId: id,
        targetType: 'user',
        targetId: id,
        reason: reportReason,
        details: reportDetails,
      });
      if (res.data.success) {
        toast.success('Report submitted to moderation');
        setShowReportModal(false);
      }
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">Loading user profile...</div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-base font-bold text-slate-800">Profile not found</p>
        <Link to="/discover" className="text-xs text-indigo-600 font-bold">
          ← Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600" />

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={
                    profile.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={profile.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                />
                {isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {profile.name}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{profile.currentCity || 'India'}</span>
                  {profile.originallyFrom?.city && (
                    <span className="text-slate-400">
                      (from {profile.originallyFrom.city})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {!isSelf && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>

                <button
                  onClick={handleSendFriendRequest}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Friend</span>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  title="Report User"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-100 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {profile.trustScore || 80}% Trust Score
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Award className="w-4 h-4 text-amber-600" />
              Level {profile.level || 1} Helper
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {profile.helpCompletedCount || 0} People Helped
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
              {profile.availability || 'Available'}
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                About
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* College & Work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Education & Work
              </h3>
              {profile.college && (
                <p className="flex items-center gap-2 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{profile.college} {profile.course ? `(${profile.course})` : ''}</span>
                </p>
              )}
              {profile.profession && (
                <p className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{profile.profession} {profile.company ? `@ ${profile.company}` : ''}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Languages
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.languages || ['Hindi', 'English']).map((l, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Can Help With */}
          {profile.canHelpCategories?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Can Help With:
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.canHelpCategories.map((cat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Verified Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No reviews recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{r.author?.name}</span>
                  <div className="flex text-amber-500">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 italic">"{r.feedback}"</p>
                <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Report User</h3>
            <form onSubmit={handleReportUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 text-xs border rounded-xl"
                >
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Fake Account">Fake Account</option>
                  <option value="Scam / Fraud">Scam / Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full p-2 text-xs border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

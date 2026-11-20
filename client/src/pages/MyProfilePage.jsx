import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Award,
  Edit3,
  Star,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const MyProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchUserReviews();
    }
  }, [user?._id]);

  const fetchUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/user/${user._id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('[Fetch reviews error]:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 relative" />

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={user?.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
              />
              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {user?.name}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Currently in <strong>{user?.currentCity || 'Delhi'}</strong></span>
                  {user?.originallyFrom?.city && (
                    <span className="text-slate-400">
                      (Originally from {user.originallyFrom.city})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-subtle transition-all self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Key Metric Badges */}
          <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-100 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {user?.trustScore || 80}% Trust Score
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Award className="w-4 h-4 text-amber-600" />
              Level {user?.level || 1} • {user?.rewardPoints || 0} Points
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              {user?.helpCompletedCount || 0} People Helped
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
              Availability: {user?.availability || 'Available'}
            </span>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-bold text-slate-800">Profile Completion: </span>
              <span className="text-indigo-600 font-extrabold">{user?.profileCompletion || 70}%</span>
            </div>
            <div className="flex-1 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${user?.profileCompletion || 70}%` }}
              />
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                About Me
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Two-Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Education & Profession
              </h3>
              {user?.college && (
                <div className="flex items-center gap-2 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{user.college} {user.course ? `(${user.course})` : ''}</span>
                </div>
              )}
              {user?.profession && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{user.profession} {user.company ? `@ ${user.company}` : ''}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(user?.languages || ['Hindi', 'English']).map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* I Can Help With */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              I Can Help With:
            </h3>
            <div className="flex flex-wrap gap-2">
              {user?.canHelpCategories?.length > 0 ? (
                user.canHelpCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No help categories specified yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Verified Reviews & Reputation ({reviews.length})
        </h3>

        {loadingReviews ? (
          <p className="text-xs text-slate-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">
            No reviews received yet. As you assist community members, verified reviews will appear here!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        r.author?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={r.author?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-900">{r.author?.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 italic">"{r.feedback}"</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Category: {r.category || 'Assistance'}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;

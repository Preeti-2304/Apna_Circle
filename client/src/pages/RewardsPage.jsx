import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Trophy,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Medal,
  MapPin,
} from 'lucide-react';

const RewardsPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('overall'); // 'overall' | 'city'
  const [leaderboardCity, setLeaderboardCity] = useState(user?.currentCity || 'Delhi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewardsData();
  }, [leaderboardType, leaderboardCity]);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      const [dashRes, leadRes] = await Promise.allSettled([
        api.get('/rewards'),
        api.get(
          `/rewards/leaderboard?type=${leaderboardType}&city=${encodeURIComponent(leaderboardCity)}`
        ),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
        setDashboard(dashRes.value.data);
      }
      if (leadRes.status === 'fulfilled' && leadRes.value.data.success) {
        setLeaderboard(leadRes.value.data.leaderboard || []);
      }
    } catch (err) {
      console.error('[Fetch Rewards Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const levelBadges = [
    { level: 1, name: 'New Member', desc: '0 - 99 pts' },
    { level: 2, name: 'Active Member', desc: '100 - 249 pts' },
    { level: 3, name: 'Community Helper', desc: '250 - 499 pts' },
    { level: 4, name: 'Trusted Helper', desc: '500 - 999 pts' },
    { level: 5, name: 'Community Champion', desc: '1,000+ pts' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Rewards Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Reputation & Recognition Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rewards, Levels & Points
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Earn genuine reputation points every time you assist fellow members. Points unlock higher helper tiers and community badges.
            </p>
          </div>

          {/* Current Score Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[160px]">
            <p className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
              Total Points
            </p>
            <p className="text-3xl font-extrabold text-white mt-0.5">
              {dashboard?.points || user?.rewardPoints || 0}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
              Level {dashboard?.level || user?.level || 1}: {dashboard?.levelName || 'New Member'}
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5">
          <div className="flex justify-between text-xs text-amber-200 font-semibold">
            <span>Progress to Next Tier</span>
            <span>{dashboard?.nextLevelProgress || 0}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${dashboard?.nextLevelProgress || 15}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Helper Levels & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Helper Levels Ladder */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            ApnaCircle Helper Levels
          </h3>

          <div className="space-y-2.5">
            {levelBadges.map((lvl) => {
              const isCurrent = (dashboard?.level || user?.level || 1) === lvl.level;
              const isPassed = (dashboard?.level || user?.level || 1) > lvl.level;

              return (
                <div
                  key={lvl.level}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                      : isPassed
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-amber-500 text-white'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {lvl.level}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{lvl.name}</p>
                      <p className="text-[10px] text-slate-500">{lvl.desc}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                      Current
                    </span>
                  )}
                  {isPassed && (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* My Badges & Achievements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-500" />
            Earned Badges & Milestones
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: 'First Help',
                desc: 'Completed 1st verified help request',
                unlocked: (user?.helpCompletedCount || 0) >= 1,
              },
              {
                name: 'Local Hero',
                desc: 'Assisted fellow members in local guidance',
                unlocked: (user?.badges || []).includes('Local Hero'),
              },
              {
                name: '10 People Helped',
                desc: 'Assisted 10+ community members',
                unlocked: (user?.helpCompletedCount || 0) >= 10,
              },
              {
                name: 'Community Champion',
                desc: 'Surpassed 1,000 reputation points',
                unlocked: (user?.rewardPoints || 0) >= 1000,
              },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-center space-y-1 transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-base">
                  🏆
                </div>
                <p className="text-xs font-bold text-slate-900">{badge.name}</p>
                <p className="text-[10px] text-slate-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Community Leaderboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Community Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              Top community contributors ranked by verified assistance and points.
            </p>
          </div>

          {/* Toggle Type & City */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLeaderboardType('overall')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                leaderboardType === 'overall'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Overall India
            </button>
            <button
              onClick={() => setLeaderboardType('city')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                leaderboardType === 'city'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              City-Wise ({leaderboardCity})
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Trust Score</th>
                <th className="py-2.5 px-3">Assistance Done</th>
                <th className="py-2.5 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((member, i) => (
                <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : `#${i + 1}`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          member.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {member.currentCity}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {member.trustScore || 80}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">
                    {member.helpCompletedCount || 0} helped
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-amber-600">
                    {member.rewardPoints || 0} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Immutable Reward Transactions Ledger */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Reward Transactions Ledger
        </h3>

        {dashboard?.transactions?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No reward transactions recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {dashboard?.transactions?.map((tx) => (
              <div
                key={tx._id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{tx.action}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleString()} • Balance after: {tx.balanceAfter} pts
                  </p>
                </div>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  +{tx.amount} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;

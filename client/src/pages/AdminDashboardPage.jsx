import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Users,
  LifeBuoy,
  Award,
  Flag,
  UserX,
  CheckCircle,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports'

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, userStatusFilter]);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userStatusFilter !== 'all') params.append('status', userStatusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports?status=all');
      if (res.data.success) {
        setReportsList(res.data.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.put(`/admin/users/${userId}/status`, {
        status: nextStatus,
      });
      if (res.data.success) {
        toast.success(`User set to ${nextStatus}`);
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleResolveReport = async (reportId, status, suspendUser = false) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/resolve`, {
        status,
        resolutionNotes: 'Resolved by Administrator',
        suspendUser,
      });
      if (res.data.success) {
        toast.success(`Report ${status}`);
        fetchReports();
      }
    } catch (e) {
      toast.error('Failed to resolve report');
    }
  };

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Administrator privileges are required to view this portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ApnaCircle Admin Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, user management, and safety moderation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-subtle self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            Users ({stats?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            Reports ({stats?.pendingReports || 0})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Users
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.totalUsers || 0}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {stats?.activeUsers || 0} Active • {stats?.suspendedUsers || 0} Suspended
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Friendships
              </span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                {stats?.totalFriendships || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Inter-city connections</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Help Completed
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats?.completedHelpRequests || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                of {stats?.totalHelpRequests || 0} total requests
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Points Issued
              </span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {stats?.totalRewardPoints || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Reward audit ledger</p>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, city..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Trust</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">{u.currentCity}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600">
                      {u.trustScore || 80}%
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                            u.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-bold text-slate-900">User & Content Reports</h3>

          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No reports submitted.</p>
          ) : (
            <div className="space-y-3">
              {reportsList.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 uppercase text-[10px] bg-rose-50 px-2 py-0.5 rounded">
                        {r.reason}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-700">Target: {r.targetType}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        Status: <strong className="text-slate-800">{r.status}</strong>
                      </span>
                    </div>

                    <p className="text-slate-600">
                      Reported User: <strong>{r.reportedUser?.name || 'N/A'}</strong> ({r.reportedUser?.email})
                    </p>
                    <p className="text-slate-600">
                      Reporter: {r.reporter?.name} ({r.reporter?.email})
                    </p>
                    {r.details && <p className="text-slate-500 italic mt-1">"{r.details}"</p>}
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleResolveReport(r._id, 'dismissed')}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(r._id, 'resolved', true)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                      >
                        Suspend User
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

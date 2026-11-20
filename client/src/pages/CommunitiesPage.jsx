import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Globe2,
  Users,
  PlusCircle,
  MapPin,
  CheckCircle,
  ArrowRight,
  Search,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'City Community',
  'Students',
  'Tech',
  'Travel',
  'Vehicle & Transit',
];

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New community form
  const [newComm, setNewComm] = useState({
    name: '',
    description: '',
    city: '',
    category: 'City Community',
  });

  useEffect(() => {
    fetchCommunities();
  }, [category]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await api.get(`/communities?${params.toString()}`);
      if (res.data.success) {
        setCommunities(res.data.communities || []);
      }
    } catch (err) {
      console.error('[Fetch communities error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (commId, isMember) => {
    try {
      if (isMember) {
        const res = await api.post(`/communities/${commId}/leave`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchCommunities();
        }
      } else {
        const res = await api.post(`/communities/${commId}/join`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchCommunities();
        }
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newComm.name || !newComm.description) return;

    try {
      const res = await api.post('/communities', newComm);
      if (res.data.success) {
        toast.success('Community created!');
        setShowCreateModal(false);
        setNewComm({ name: '', description: '', city: '', category: 'City Community' });
        fetchCommunities();
      }
    } catch (err) {
      toast.error('Failed to create community');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-indigo-600" />
            City-Based Communities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join local city hubs, university alumni groups, and specialized traveler circles.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading communities...</div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <p className="text-sm font-bold text-slate-800">No communities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((comm) => (
            <div
              key={comm._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {comm.category}
                  </span>
                  {comm.city && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {comm.city}
                    </span>
                  )}
                </div>

                <Link
                  to={`/communities/${comm._id}`}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 mb-2 block"
                >
                  {comm.name}
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {comm.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{comm.memberCount || 1} members</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/communities/${comm._id}`}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                >
                  View Discussions
                </Link>

                <button
                  onClick={() => handleJoinLeave(comm._id, comm.isMember)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    comm.isMember
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  }`}
                >
                  {comm.isMember ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Community</h3>
            <form onSubmit={handleCreateCommunity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  value={newComm.name}
                  onChange={(e) => setNewComm({ ...newComm, name: e.target.value })}
                  placeholder="e.g. Pune Tech Founders"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target City (Optional)
                </label>
                <input
                  type="text"
                  value={newComm.city}
                  onChange={(e) => setNewComm({ ...newComm, city: e.target.value })}
                  placeholder="e.g. Pune, Delhi..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newComm.category}
                  onChange={(e) => setNewComm({ ...newComm, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  <option value="City Community">City Community</option>
                  <option value="Students">Students</option>
                  <option value="Tech">Tech</option>
                  <option value="Travel">Travel</option>
                  <option value="Vehicle & Transit">Vehicle & Transit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newComm.description}
                  onChange={(e) => setNewComm({ ...newComm, description: e.target.value })}
                  placeholder="What is this community about? Who should join?"
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;

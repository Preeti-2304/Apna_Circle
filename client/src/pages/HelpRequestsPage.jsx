import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import HelpRequestCard from '../components/HelpRequestCard';
import HelperMatchModal from '../components/HelperMatchModal';
import CityFilterBar from '../components/CityFilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Vehicle Help',
  'Travel Help',
  'Local Guidance',
  'Technology Help',
  'Education Help',
  'Accommodation Guidance',
  'Emergency Assistance',
];

const HelpRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('all');
  const [myRequests, setMyRequests] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRequestForMatches, setSelectedRequestForMatches] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [selectedCity, category, status, myRequests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (category && category !== 'All Categories') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (myRequests) params.append('myRequests', 'true');
      if (search) params.append('search', search);

      const res = await api.get(`/help-requests?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.helpRequests || []);
      }
    } catch (err) {
      console.error('[Fetch Requests Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-indigo-600" />
            Help Requests & Local Assistance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            "Don't just search a place. Find a person who can help." Browse community requests or ask for assistance.
          </p>
        </div>

        <Link
          to="/help-requests/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask For Help</span>
        </Link>
      </div>

      {/* City Filter Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-subtle">
        <CityFilterBar
          selectedCity={selectedCity}
          onCitySelect={(c) => setSelectedCity(c)}
          title="Filter by City"
        />
      </div>

      {/* Filter Row: Category tabs, status toggles, search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search requests by title, description, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Select */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Matched">Matched</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* My Requests Toggle */}
            <button
              onClick={() => setMyRequests((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                myRequests
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              My Requests Only
            </button>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No help requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No requests match your current filters. Have something you need help with? Create a request!
          </p>
          <div className="pt-2">
            <Link
              to="/help-requests/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Create Help Request
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => (
            <HelpRequestCard
              key={req._id}
              request={req}
              onOpenMatches={(r) => setSelectedRequestForMatches(r)}
            />
          ))}
        </div>
      )}

      {/* Smart Match Modal */}
      {selectedRequestForMatches && (
        <HelperMatchModal
          request={selectedRequestForMatches}
          isOpen={!!selectedRequestForMatches}
          onClose={() => setSelectedRequestForMatches(null)}
          onHelperAccepted={() => fetchRequests()}
        />
      )}
    </div>
  );
};

export default HelpRequestsPage;

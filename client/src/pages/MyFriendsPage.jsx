import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import FriendCard from '../components/FriendCard';
import CityFilterBar from '../components/CityFilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  UserPlus,
  Compass,
  MapPin,
  GraduationCap,
} from 'lucide-react';

const MyFriendsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'all';

  const [friends, setFriends] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [fromCity, setFromCity] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest_trust' | 'most_helpful' | 'distance'

  useEffect(() => {
    fetchFriends();
  }, [selectedCity, fromCity, collegeFilter, skillFilter, categoryFilter, sortBy]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (fromCity && fromCity !== 'all') params.append('fromCity', fromCity);
      if (collegeFilter) params.append('college', collegeFilter);
      if (skillFilter && skillFilter !== 'all') params.append('skill', skillFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/friends?${params.toString()}`);
      if (res.data.success) {
        setFriends(res.data.friends || []);
        setTotalCount(res.data.total || 0);
        if (res.data.availableCities) {
          setAvailableCities(res.data.availableCities);
        }
      }
    } catch (err) {
      console.error('[Fetch Friends Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (city === 'all') {
      searchParams.delete('city');
    } else {
      searchParams.set('city', city);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFriends();
  };

  const handleRemoveFriend = (friendId) => {
    setFriends((prev) => prev.filter((f) => f._id !== friendId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            My Friends Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Accepted Friends: <strong className="text-slate-800">{totalCount}</strong> • Filter friends by current city when you visit other places!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/friends/requests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-subtle transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            Friend Requests
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <Compass className="w-3.5 h-3.5" />
            Find More Friends
          </Link>
        </div>
      </div>

      {/* City-Based Filter Bar (Core Requirement TEST 4) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-subtle">
        <CityFilterBar
          selectedCity={selectedCity}
          onCitySelect={handleCitySelect}
          availableCities={availableCities}
          title="Filter by Current City"
        />
      </div>

      {/* Advanced Filters & Sorting Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search friends by name, skills, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Help Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Help Categories</option>
              <option value="Vehicle Help">Vehicle Help</option>
              <option value="Travel Help">Travel Help</option>
              <option value="Local Guidance">Local Guidance</option>
              <option value="Technology Help">Technology Help</option>
              <option value="Accommodation Guidance">Accommodation Guidance</option>
              <option value="Emergency Assistance">Emergency Assistance</option>
            </select>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="recent">Recently Added</option>
                <option value="highest_trust">Highest Trust Score</option>
                <option value="most_helpful">Most Helpful</option>
                <option value="distance">Nearest Distance</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Friends Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : friends.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {selectedCity && selectedCity !== 'all'
              ? `No friends found in ${selectedCity}`
              : 'No friends in this filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {selectedCity && selectedCity !== 'all'
              ? `You don't have any accepted friends whose current city is ${selectedCity} yet. Discover locals in ${selectedCity}!`
              : 'Try clearing your filters or explore people from other colleges and cities.'}
          </p>
          <div className="pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              Discover People
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {friends.map((friend) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              onRemoveFriend={handleRemoveFriend}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFriendsPage;

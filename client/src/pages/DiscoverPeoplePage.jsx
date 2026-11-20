import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import MapView from '../components/MapView';
import CityFilterBar from '../components/CityFilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Compass,
  Search,
  Filter,
  Map,
  Grid,
  MapPin,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

const DiscoverPeoplePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || 'all';

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [college, setCollege] = useState('');
  const [category, setCategory] = useState('all');
  const [skill, setSkill] = useState('all');
  const [radius, setRadius] = useState(25);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]); // Delhi default

  useEffect(() => {
    fetchUsers();
  }, [city, category, skill, viewMode, radius]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (viewMode === 'map') {
        const res = await api.get(
          `/users/nearby?city=${encodeURIComponent(city !== 'all' ? city : 'Delhi')}&radius=${radius}&category=${category !== 'all' ? category : ''}`
        );
        if (res.data.success) {
          setUsers(res.data.users || []);
          setTotal(res.data.count || 0);
          if (res.data.center && res.data.center.length === 2) {
            setMapCenter([res.data.center[1], res.data.center[0]]); // [lat, lng]
          }
        }
      } else {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (city && city !== 'all') params.append('city', city);
        if (college) params.append('college', college);
        if (category && category !== 'all') params.append('category', category);
        if (skill && skill !== 'all') params.append('skill', skill);

        const res = await api.get(`/users/discover?${params.toString()}`);
        if (res.data.success) {
          setUsers(res.data.users || []);
          setTotal(res.data.total || 0);
        }
      }
    } catch (err) {
      console.error('[Discover fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCitySelect = (c) => {
    setCity(c);
    if (c === 'all') {
      searchParams.delete('city');
    } else {
      searchParams.set('city', c);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-indigo-600" />
            Discover People & Local Helpers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with trusted members across India. Find helpers for vehicles, travel, tech, and emergencies.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-subtle self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'map'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* City Filter Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-subtle">
        <CityFilterBar
          selectedCity={city}
          onCitySelect={handleCitySelect}
          title="Filter by City"
        />
      </div>

      {/* Advanced Filter Inputs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, college (e.g. DTU, IIT), skills, profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Can Help Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

            {/* Radius for Map view */}
            {viewMode === 'map' && (
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
              </select>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView center={mapCenter} radiusKm={radius} users={users} />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {users.length} members with approximate location markers</span>
            <span>Live coordinates are protected with privacy jitter</span>
          </div>
        </div>
      ) : loading ? (
        <LoadingSkeleton count={6} />
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <p className="text-base font-bold text-slate-800">No members match your search criteria</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your city or category filters to discover more people across India.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((userItem) => (
            <ProfileCard
              key={userItem._id}
              userItem={userItem}
              onStatusChange={(id, status) => {
                setUsers((prev) =>
                  prev.map((u) => (u._id === id ? { ...u, friendshipStatus: status } : u))
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverPeoplePage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Menu,
  MapPin,
  Search,
  PlusCircle,
  Bell,
  Navigation,
  Check,
  ChevronDown,
} from 'lucide-react';

const CITIES = [
  'Delhi',
  'Jaipur',
  'Mumbai',
  'Bangalore',
  'Lucknow',
  'Pune',
  'Chandigarh',
  'Ahmedabad',
  'Hyderabad',
  'Kolkata',
];

const TopHeader = ({ onMobileMenuToggle }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleCityChange = async (newCity) => {
    setIsCityDropdownOpen(false);
    try {
      const res = await api.put('/users/profile', {
        currentlyLivingIn: { city: newCity, country: 'India' },
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success(`Current city switched to ${newCity}!`);
      }
    } catch (e) {
      toast.error('Failed to update city');
    }
  };

  const handleRequestLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { longitude, latitude } = pos.coords;
          const res = await api.put('/users/profile', {
            coordinates: [longitude, latitude],
            hideLiveLocation: false,
          });
          if (res.data.success) {
            updateUser(res.data.user);
            toast.success('Live location updated successfully!');
          }
        } catch (e) {
          toast.error('Failed to sync location to server');
        } finally {
          setIsLocating(false);
          setIsCityDropdownOpen(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Location permission denied: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      {/* Left section: mobile hamburger & City Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current City Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsCityDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-900 text-xs font-semibold hover:bg-indigo-100/70 transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>{user?.currentCity || 'Select City'}</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-floating border border-slate-100 py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Current Location
              </div>

              {/* Live Location Action */}
              <button
                onClick={handleRequestLiveLocation}
                disabled={isLocating}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/70 flex items-center gap-2"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <div className="max-h-48 overflow-y-auto py-1">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityChange(city)}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{city}</span>
                    {user?.currentCity?.toLowerCase() === city.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search people by name, college, skills, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-transparent rounded-full text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/help-requests/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask for Help</span>
          <span className="sm:hidden">Help</span>
        </Link>

        {/* Notifications Icon Link */}
        <Link
          to="/notifications"
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Profile Avatar */}
        <Link to="/profile/me" className="flex items-center gap-2 pl-1">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-indigo-500/30 transition-all"
          />
        </Link>
      </div>
    </header>
  );
};

export default TopHeader;

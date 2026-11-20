import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Settings, Shield, Bell, Lock, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState(user?.profileVisibility || 'public');
  const [hideLiveLocation, setHideLiveLocation] = useState(user?.hideLiveLocation || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        profileVisibility: visibility,
        hideLiveLocation,
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Privacy settings saved');
      }
    } catch (e) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600" />
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account security, location privacy, and communication preferences.
        </p>
      </div>

      {/* Privacy Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Location & Profile Privacy
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Profile Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="public">Public (Visible to everyone in discovery & city circles)</option>
              <option value="friends_only">Friends Only (Visible only to accepted friends)</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Hide live location */}
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Hide Live GPS Location</p>
              <p className="text-[11px] text-slate-500">
                When enabled, other users will only see your approximate current city, not your map coordinates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideLiveLocation}
              onChange={(e) => setHideLiveLocation(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="text-right">
            <button
              onClick={handleSavePrivacy}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Logout / Danger Zone */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out of ApnaCircle</h3>
          <p className="text-xs text-slate-500">You can sign back in at any time.</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

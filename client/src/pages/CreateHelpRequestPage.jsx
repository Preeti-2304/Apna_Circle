import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  LifeBuoy,
  PlusCircle,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'Vehicle Help',
  'Travel Help',
  'Local Guidance',
  'Technology Help',
  'Education Help',
  'Accommodation Guidance',
  'Emergency Assistance',
  'Other',
];

const URGENCIES = ['Low', 'Medium', 'High', 'Emergency'];

const LANGUAGES = ['Hindi', 'English', 'Punjabi', 'Rajasthani', 'Marathi', 'Gujarati', 'Bengali', 'Tamil'];

const CreateHelpRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Vehicle Help',
    city: user?.currentCity || 'Delhi',
    urgency: 'Medium',
    preferredLanguage: 'Hindi',
    requiredSkills: '',
    visibility: 'public',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills
          ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await api.post('/help-requests', payload);
      if (res.data.success) {
        toast.success('Help request posted successfully!');
        navigate(`/help-requests/${res.data.helpRequest._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create help request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
          <LifeBuoy className="w-3.5 h-3.5 text-indigo-600" />
          <span>Local Community Assistance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create a Help Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ask nearby friends and community members for guidance, vehicle troubleshooting, or emergency assistance.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Flat tyre and battery jumpstart needed near Connaught Place"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>

          {/* Category & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold text-slate-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Delhi, Jaipur, Mumbai..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Urgency & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Urgency Level
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold"
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {u} Urgency {u === 'Emergency' ? '🚨' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Language
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills (Comma separated) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Required Skills (Optional, comma-separated)
            </label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. Vehicle Knowledge, Car Battery, Tool Kit"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide exact details of what assistance you need, landmarks, timing, and any equipment required..."
              className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/help-requests"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Help Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHelpRequestPage;

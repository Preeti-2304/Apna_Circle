import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Upload,
  ArrowLeft,
  Check,
  Navigation,
} from 'lucide-react';

const HELP_CATEGORIES = [
  'Travel Help',
  'Vehicle Help',
  'Local Guidance',
  'Technology Help',
  'Education Help',
  'Accommodation Guidance',
  'Emergency Assistance',
  'Healthcare Guidance',
];

const SKILL_SUGGESTIONS = [
  'Technology',
  'Vehicle Knowledge',
  'Travel',
  'Local Guidance',
  'Accommodation Guidance',
  'Emergency Assistance',
  'Education Guidance',
  'Healthcare Guidance',
];

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    currentlyLivingInCity: user?.currentCity || user?.currentlyLivingIn?.city || 'Delhi',
    originallyFromCity: user?.originallyFrom?.city || '',
    college: user?.college || '',
    course: user?.course || '',
    profession: user?.profession || '',
    company: user?.company || '',
    languages: user?.languages?.join(', ') || 'Hindi, English',
    skills: user?.skills || [],
    canHelpCategories: user?.canHelpCategories || [],
    availability: user?.availability || 'Available',
    profileVisibility: user?.profileVisibility || 'public',
    preferredContact: user?.preferredContact || 'chat',
    hideLiveLocation: user?.hideLiveLocation || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.canHelpCategories.includes(cat);
      return {
        ...prev,
        canHelpCategories: exists
          ? prev.canHelpCategories.filter((c) => c !== cat)
          : [...prev.canHelpCategories, cat],
      };
    });
  };

  const toggleSkill = (sk) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(sk);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== sk) : [...prev.skills, sk],
      };
    });
  };

  const handleRequestLiveGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          coordinates: [pos.coords.longitude, pos.coords.latitude],
          hideLiveLocation: false,
        }));
        setIsLocating(false);
        toast.success('Live GPS coordinates captured!');
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Permission denied: ${err.message}`);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        avatar: formData.avatar,
        bio: formData.bio.trim(),
        gender: formData.gender,
        currentlyLivingIn: {
          city: formData.currentlyLivingInCity.trim(),
          country: 'India',
        },
        originallyFrom: {
          city: formData.originallyFromCity.trim(),
          country: 'India',
        },
        college: formData.college.trim(),
        course: formData.course.trim(),
        profession: formData.profession.trim(),
        company: formData.company.trim(),
        languages: formData.languages
          ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
          : ['Hindi', 'English'],
        skills: formData.skills,
        canHelpCategories: formData.canHelpCategories,
        availability: formData.availability,
        profileVisibility: formData.profileVisibility,
        preferredContact: formData.preferredContact,
        hideLiveLocation: formData.hideLiveLocation,
        coordinates: formData.coordinates,
      };

      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile saved successfully!');
        navigate('/profile/me');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/profile/me"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Profile</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-slate-900 mb-6">Edit Profile Details</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar URL / Preview */}
          <div className="flex items-center gap-4">
            <img
              src={
                formData.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Currently Living In (Current City)
              </label>
              <input
                type="text"
                name="currentlyLivingInCity"
                required
                value={formData.currentlyLivingInCity}
                onChange={handleInputChange}
                placeholder="e.g. Delhi"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Originally From (Hometown)
              </label>
              <input
                type="text"
                name="originallyFromCity"
                value={formData.originallyFromCity}
                onChange={handleInputChange}
                placeholder="e.g. Jaipur"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* GPS Location Permission */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-indigo-950">Precise Geolocation (Optional)</p>
              <p className="text-[11px] text-indigo-700">
                Enhances nearest helper match accuracy. Live coordinates are never exposed to others.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestLiveGPS}
              disabled={isLocating}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>Capture GPS</span>
            </button>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell friends and neighbors a bit about yourself, hobbies, and interests..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* College & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                College / University
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                placeholder="e.g. Delhi Technological University (DTU)"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Profession / Job Title
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Languages Spoken (comma-separated)
            </label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleInputChange}
              placeholder="e.g. Hindi, English, Punjabi"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* "I CAN HELP WITH" Category multi-select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              "I CAN HELP WITH" Assistance Categories:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HELP_CATEGORIES.map((cat) => {
                const selected = formData.canHelpCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills Multi-select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Skills:
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.map((sk) => {
                const selected = formData.skills.includes(sk);
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => toggleSkill(sk)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability & Preferred Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Availability
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-semibold"
              >
                <option value="Available">Available for Help</option>
                <option value="Busy">Busy (Limited availability)</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="chat">ApnaCircle Chat</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/profile/me"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;

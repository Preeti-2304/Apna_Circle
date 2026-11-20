import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Shield, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">ApnaCircle</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "DON'T JUST SEARCH A PLACE. FIND A PERSON WHO CAN HELP."
            </p>
            <p className="text-xs text-slate-500">
              Connecting people across Delhi, Jaipur, Mumbai, Bangalore, Pune, Lucknow, and beyond.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/discover" className="hover:text-indigo-400 transition-colors">
                  Discover People
                </Link>
              </li>
              <li>
                <Link to="/help-requests" className="hover:text-indigo-400 transition-colors">
                  Local Help Requests
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-indigo-400 transition-colors">
                  City Communities
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-indigo-400 transition-colors">
                  Rewards & Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Help Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>Vehicle & Transit Assistance</li>
              <li>Local City Guidance & Heritage</li>
              <li>PG & Accommodation Advice</li>
              <li>Tech & Engineering Mentorship</li>
              <li>Emergency Local Support</li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Verified Community Members
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Privacy-Preserved Coordinates
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Smart Helper Compatibility
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ApnaCircle Network Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Community Guidelines</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

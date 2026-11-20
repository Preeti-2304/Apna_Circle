import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Compass, HelpCircle, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
                ApnaCircle
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Your Cities. Your Circle.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/discover"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Discover People
            </Link>
            <Link
              to="/help-requests"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Help Requests
            </Link>
            <Link
              to="/communities"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Communities
            </Link>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:shadow-indigo-500/25"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  Join ApnaCircle
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

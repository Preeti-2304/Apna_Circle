import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (!result.user.isVerified) {
        navigate(`/verify-otp?email=${encodeURIComponent(result.user.email)}`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to ApnaCircle
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your city circle, friends, and help requests.
          </p>
        </div>

        {/* Demo Fast Logins Bar */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Quick Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('rahul@apnacircle.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold text-indigo-900 hover:bg-indigo-100 transition-colors"
            >
              Rahul (Delhi)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('priya@apnacircle.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold text-indigo-900 hover:bg-indigo-100 transition-colors"
            >
              Priya (Jaipur)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin@apnacircle.com', 'Admin@123')}
              className="px-2 py-1.5 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
            Join ApnaCircle
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

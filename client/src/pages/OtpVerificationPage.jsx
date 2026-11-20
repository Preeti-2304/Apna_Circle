import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const OtpVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, user } = useAuth();

  const emailParam = searchParams.get('email') || user?.email || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Please enter email and 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    const result = await verifyOtp(email, otp);
    setIsVerifying(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }
    setIsResending(true);
    const res = await resendOtp(email);
    setIsResending(false);
    if (res.devOtp) {
      setDemoOtp(res.devOtp);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verify Your Account
          </h2>
          <p className="text-xs text-slate-500">
            We sent a 6-digit security code to{' '}
            <span className="font-semibold text-slate-700">{email || 'your email'}</span>.
          </p>
        </div>

        {demoOtp && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-amber-800 font-medium">Dev OTP: <strong>{demoOtp}</strong></span>
            <button
              onClick={() => setOtp(demoOtp)}
              className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
            >
              Autofill
            </button>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-xl tracking-[0.4em] font-extrabold py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length < 6}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend Code</span>
          </button>

          <Link to="/login" className="text-slate-500 hover:text-slate-800">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;

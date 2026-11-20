import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Check, X, Clock, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FriendRequestsPage = () => {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/friends/requests');
      if (res.data.success) {
        setReceived(res.data.received || []);
        setSent(res.data.sent || []);
      }
    } catch (err) {
      console.error('[Fetch Requests Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await api.post(`/friends/accept/${requestId}`);
      if (res.data.success) {
        toast.success('Friend request accepted!');
        setReceived((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await api.post(`/friends/reject/${requestId}`);
      if (res.data.success) {
        toast.success('Friend request rejected');
        setReceived((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await api.post(`/friends/cancel/${requestId}`);
      if (res.data.success) {
        toast.success('Friend request cancelled');
        setSent((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UserPlus className="w-6 h-6 text-indigo-600" />
          Friend Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming friendship connections and monitor sent requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Received Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
            {received.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Sent Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {sent.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading requests...</div>
      ) : activeTab === 'received' ? (
        received.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <UserPlus className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No pending received requests</p>
            <p className="text-xs text-slate-500">
              When people invite you to their circle, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      req.sender?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={req.sender?.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <Link
                      to={`/profile/${req.sender?._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {req.sender?.name}
                    </Link>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{req.sender?.currentCity}</span>
                      {req.sender?.college && <span>• {req.sender.college}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleReject(req._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>

                  <button
                    onClick={() => handleAccept(req._id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : sent.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No sent requests pending</p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Find People to Connect
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sent.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    req.recipient?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={req.recipient?.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{req.recipient?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{req.recipient?.currentCity}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCancel(req._id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Cancel Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequestsPage;

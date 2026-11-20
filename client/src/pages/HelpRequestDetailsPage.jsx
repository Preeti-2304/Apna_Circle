import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import HelperMatchModal from '../components/HelperMatchModal';
import ReviewModal from '../components/ReviewModal';
import {
  LifeBuoy,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Award,
  AlertTriangle,
  User,
  ArrowLeft,
  Check,
} from 'lucide-react';

const HelpRequestDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerMessage, setOfferMessage] = useState('');
  const [isOffering, setIsOffering] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/help-requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.helpRequest);
      }
    } catch (err) {
      toast.error('Failed to load help request');
    } finally {
      setLoading(false);
    }
  };

  const isCreator = request?.creator?._id === user?._id;
  const isAcceptedHelper = request?.acceptedHelper?._id === user?._id;
  const hasOffered = request?.responses?.some((r) => r.helper?._id === user?._id);

  const handleOfferHelp = async (e) => {
    e.preventDefault();
    if (!offerMessage.trim()) return;

    setIsOffering(true);
    try {
      const res = await api.post(`/help-requests/${id}/respond`, {
        message: offerMessage.trim(),
      });
      if (res.data.success) {
        toast.success('Your offer to help has been sent to the creator!');
        setOfferMessage('');
        fetchRequestDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setIsOffering(false);
    }
  };

  const handleAcceptHelper = async (helperId) => {
    try {
      const res = await api.post(`/help-requests/${id}/accept`, { helperId });
      if (res.data.success) {
        toast.success('Helper accepted! Request is now In Progress.');
        fetchRequestDetails();
      }
    } catch (err) {
      toast.error('Failed to accept helper');
    }
  };

  const handleConfirmCompletion = async () => {
    if (
      window.confirm(
        'Are you sure you want to confirm completion? Reward points will be awarded to your helper.'
      )
    ) {
      setIsCompleting(true);
      try {
        const res = await api.post(`/help-requests/${id}/complete`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchRequestDetails();
          // Prompt review modal after completion
          setIsReviewModalOpen(true);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to confirm completion');
      } finally {
        setIsCompleting(false);
      }
    }
  };

  const handleStartChatWith = async (targetUserId) => {
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: targetUserId,
        helpRequestId: request._id,
      });
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      toast.error('Could not open chat');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading help request details...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-base font-bold text-slate-800">Help request not found</p>
        <Link to="/help-requests" className="text-xs text-indigo-600 font-bold">
          ← Back to Help Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/help-requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Help Requests</span>
      </Link>

      {/* Main Request Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8 space-y-6">
        {/* Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {request.category}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                request.urgency === 'Emergency'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : request.urgency === 'High'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {request.urgency} Urgency
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                request.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : request.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Status: {request.status}
            </span>
          </div>

          {/* Smart Match Trigger */}
          <button
            onClick={() => setIsMatchingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Recommended Helpers (Smart Match)</span>
          </button>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            {request.title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Meta Info Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
            <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {request.city}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preferred Language</p>
            <p className="font-bold text-slate-800 mt-0.5">{request.preferredLanguage || 'Hindi'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Posted By</p>
            <p className="font-bold text-slate-800 mt-0.5">{request.creator?.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Posted Date</p>
            <p className="font-medium text-slate-600 mt-0.5">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Assigned Helper section (if In Progress or Completed) */}
        {request.acceptedHelper && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  request.acceptedHelper?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={request.acceptedHelper?.name}
                className="w-12 h-12 rounded-2xl object-cover border border-emerald-200"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Assigned Helper
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {request.acceptedHelper?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {request.acceptedHelper?.currentCity} • {request.acceptedHelper?.trustScore || 80}% Trust
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartChatWith(request.acceptedHelper?._id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-50 shadow-sm flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>Chat with Helper</span>
              </button>

              {/* Confirm Completion button for Creator */}
              {isCreator && request.status === 'In Progress' && (
                <button
                  onClick={handleConfirmCompletion}
                  disabled={isCompleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Assistance Completed</span>
                </button>
              )}

              {/* Review button if Completed */}
              {request.status === 'Completed' && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Write Review</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action: Offer to Help (if not creator and not already responded) */}
        {!isCreator && request.status === 'Open' && (
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-indigo-600" />
              Can you assist with this request?
            </h3>
            {hasOffered ? (
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                You have already offered help. The creator will review and accept your offer!
              </p>
            ) : (
              <form onSubmit={handleOfferHelp} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Introduce yourself and explain how you can help (e.g. I have jumper cables and can arrive in 15 mins)..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isOffering}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
                >
                  {isOffering ? 'Submitting...' : 'Offer Assistance'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Responses / Offers List (Visible to Creator) */}
        {isCreator && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Incoming Helper Offers ({request.responses?.length || 0})
            </h3>

            {request.responses?.length === 0 ? (
              <p className="text-xs text-slate-500">
                No helper offers yet. Click "Recommended Helpers" to discover matches and reach out!
              </p>
            ) : (
              <div className="space-y-3">
                {request.responses.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          resp.helper?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={resp.helper?.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {resp.helper?.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {resp.helper?.trustScore || 80}% Trust
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 italic">"{resp.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleStartChatWith(resp.helper?._id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        Chat
                      </button>

                      {request.status === 'Open' && (
                        <button
                          onClick={() => handleAcceptHelper(resp.helper?._id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Matching Engine Modal */}
      <HelperMatchModal
        request={request}
        isOpen={isMatchingModalOpen}
        onClose={() => setIsMatchingModalOpen(false)}
        onHelperAccepted={() => fetchRequestDetails()}
      />

      {/* Review Modal */}
      <ReviewModal
        request={request}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={() => fetchRequestDetails()}
      />
    </div>
  );
};

export default HelpRequestDetailsPage;

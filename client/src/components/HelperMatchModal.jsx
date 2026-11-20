import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const HelperMatchModal = ({ request, isOpen, onClose, onHelperAccepted }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    if (isOpen && request?._id) {
      fetchMatches();
    }
  }, [isOpen, request?._id]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/help-requests/${request._id}/matches`);
      if (res.data.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      toast.error('Failed to calculate helper recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptHelper = async (helperId) => {
    setAcceptingId(helperId);
    try {
      const res = await api.post(`/help-requests/${request._id}/accept`, {
        helperId,
      });
      if (res.data.success) {
        toast.success('Helper accepted! Request is now In Progress.');
        if (onHelperAccepted) onHelperAccepted(res.data.helpRequest);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept helper');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleMessageHelper = async (helperId) => {
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: helperId,
        helpRequestId: request._id,
      });
      if (res.data.success) {
        onClose();
        navigate(`/messages?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      toast.error('Failed to open chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Smart Helper Match Engine</h3>
              <p className="text-xs text-indigo-200">
                Compatibility for: <span className="font-semibold text-white">{request?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm Formula Notice */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-2.5 text-[11px] text-indigo-900 flex items-center justify-between gap-2">
          <span>
            Formula: 35% Skills + 25% Language + 20% Distance + 10% Trust + 10% Availability
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
            System Recommendation
          </span>
        </div>

        {/* Matches Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Evaluating skills, languages, distance & trust metrics...
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-800 mb-1">
                No recommended helpers found
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active helpers in {request?.city} currently match the specific criteria.
                Other community members can still view your public request.
              </p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const { helper, matchScore, breakdown, distanceKm, reason, matchingSkills } = item;
              const isExpanded = expandedId === helper._id;

              return (
                <div
                  key={helper._id}
                  className={`border rounded-2xl p-4 transition-all ${
                    idx === 0
                      ? 'border-indigo-300 bg-indigo-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={
                          helper.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={helper.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{helper.name}</h4>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-600 text-white">
                              Best Match
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {helper.currentCity}
                          </span>
                          {distanceKm && (
                            <span className="text-[11px] text-indigo-600 font-semibold">
                              (~{distanceKm} km)
                            </span>
                          )}
                        </div>

                        {/* Why recommended text */}
                        <p className="text-xs text-slate-600 mt-2 font-medium">
                          {reason}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Display */}
                    <div className="text-right flex-shrink-0">
                      <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200">
                        <span className="text-base font-extrabold text-indigo-700">
                          {matchScore}%
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500">
                          Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle breakdown details */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : helper._id)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Compatibility Breakdown</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMessageHelper(helper._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      <button
                        onClick={() => handleAcceptHelper(helper._id)}
                        disabled={acceptingId === helper._id}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Helper</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown Table */}
                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-5 gap-2 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Skills (35%)</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{breakdown.skillScore}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Language (25%)</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{breakdown.languageScore}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Distance (20%)</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{breakdown.distanceScore}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Trust (10%)</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{breakdown.trustScore}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Availability (10%)</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{breakdown.availabilityScore}%</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelperMatchModal;

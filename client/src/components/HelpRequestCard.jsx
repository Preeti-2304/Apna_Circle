import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Travel Help': 'bg-sky-50 text-sky-700 border-sky-200',
  'Vehicle Help': 'bg-amber-50 text-amber-800 border-amber-200',
  'Local Guidance': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Technology Help': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Education Help': 'bg-purple-50 text-purple-700 border-purple-200',
  'Accommodation Guidance': 'bg-teal-50 text-teal-700 border-teal-200',
  'Emergency Assistance': 'bg-rose-50 text-rose-700 border-rose-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

const URGENCY_COLORS = {
  Emergency: 'bg-rose-600 text-white animate-pulse',
  High: 'bg-rose-50 text-rose-700 border border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  Low: 'bg-slate-100 text-slate-600',
};

const HelpRequestCard = ({ request, onOpenMatches }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              CATEGORY_COLORS[request.category] || CATEGORY_COLORS.Other
            }`}
          >
            {request.category}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                URGENCY_COLORS[request.urgency] || URGENCY_COLORS.Medium
              }`}
            >
              {request.urgency} Urgency
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                request.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : request.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/help-requests/${request._id}`}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2"
        >
          {request.title}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {request.description}
        </p>

        {/* Meta info: Creator & City */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <img
              src={
                request.creator?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              }
              alt={request.creator?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium text-slate-700 truncate max-w-[120px]">
              {request.creator?.name || 'Community Member'}
            </span>
          </div>

          <div className="flex items-center gap-1 font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span>{request.city}</span>
          </div>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenMatches && onOpenMatches(request)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Smart Match</span>
        </button>

        <Link
          to={`/help-requests/${request._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default HelpRequestCard;

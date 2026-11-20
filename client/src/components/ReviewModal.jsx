import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Star, X, ShieldCheck } from 'lucide-react';

const ReviewModal = ({ request, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please provide written feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        helpRequestId: request._id,
        rating,
        feedback: feedback.trim(),
      });
      if (res.data.success) {
        toast.success('Thank you! Your verified review has been submitted.');
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Leave a Verified Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">Assistance Transaction:</p>
            <p className="text-sm font-bold text-slate-900 line-clamp-1">{request?.title}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
              {request?.category}
            </span>
          </div>

          {/* Star Rating Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Rate your experience:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">{rating} out of 5</span>
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Your Feedback:
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How was the assistance? Was the person helpful, punctual, and knowledgeable?"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

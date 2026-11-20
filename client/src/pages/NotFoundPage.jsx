import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
        <Users className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-sm font-semibold text-slate-700">Page not found</p>
      <p className="text-xs text-slate-500 max-w-sm">
        The link you followed may be broken or the page may have been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to ApnaCircle</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

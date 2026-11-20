import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { Users } from 'lucide-react';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white animate-bounce">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading ApnaCircle...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main App Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

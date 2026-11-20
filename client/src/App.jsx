import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Authenticated Pages
import DashboardPage from './pages/DashboardPage';
import DiscoverPeoplePage from './pages/DiscoverPeoplePage';
import MyFriendsPage from './pages/MyFriendsPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import FriendsOfFriendsPage from './pages/FriendsOfFriendsPage';
import HelpRequestsPage from './pages/HelpRequestsPage';
import CreateHelpRequestPage from './pages/CreateHelpRequestPage';
import HelpRequestDetailsPage from './pages/HelpRequestDetailsPage';
import RewardsPage from './pages/RewardsPage';
import MessagesPage from './pages/MessagesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';
import MyProfilePage from './pages/MyProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              padding: '12px 16px',
            },
          }}
        />

        <Routes>
          {/* Public Marketing & Auth routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Authenticated Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/discover" element={<DiscoverPeoplePage />} />
            <Route path="/friends" element={<MyFriendsPage />} />
            <Route path="/friends/requests" element={<FriendRequestsPage />} />
            <Route path="/friends/of-friends" element={<FriendsOfFriendsPage />} />
            <Route path="/help-requests" element={<HelpRequestsPage />} />
            <Route path="/help-requests/create" element={<CreateHelpRequestPage />} />
            <Route path="/help-requests/:id" element={<HelpRequestDetailsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/communities/:id" element={<CommunityDetailsPage />} />
            <Route path="/profile/me" element={<MyProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

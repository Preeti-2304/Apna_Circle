import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('apnacircle_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('apnacircle_token'));
  const [loading, setLoading] = useState(true);

  // Sync token & user from localStorage on mount & listen for unauthorized events
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('apnacircle_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('apnacircle_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    checkAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('apnacircle_token', newToken);
        localStorage.setItem('apnacircle_user', JSON.stringify(newUser));
        toast.success(`Welcome back, ${newUser.name.split(' ')[0]}!`);
        return { success: true, user: newUser };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token: newToken, user: newUser, devOtp } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('apnacircle_token', newToken);
        localStorage.setItem('apnacircle_user', JSON.stringify(newUser));
        toast.success('Registration successful! Please verify your OTP.');
        return { success: true, user: newUser, devOtp };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        const { token: newToken, user: updatedUser } = res.data;
        if (newToken) {
          setToken(newToken);
          localStorage.setItem('apnacircle_token', newToken);
        }
        setUser(updatedUser);
        localStorage.setItem('apnacircle_user', JSON.stringify(updatedUser));
        toast.success('Account verified successfully! +50 Bonus Points.');
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP code.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      if (res.data.success) {
        toast.success('New OTP sent to your email');
        return { success: true, devOtp: res.data.devOtp };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset code sent if email exists');
      return { success: true, devOtp: res.data.devOtp };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
      return { success: false };
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(res.data.message || 'Password reset successfully');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('apnacircle_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('apnacircle_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('[RefreshUser Error]:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('apnacircle_token');
    localStorage.removeItem('apnacircle_user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

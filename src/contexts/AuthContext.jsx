import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูล user จาก localStorage เมื่อ component mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        const userDataResponse = response.data.user;
        setUser(userDataResponse);
        return { success: true, user: userDataResponse };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        return { success: false, error: response.message || 'Update failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Password change failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};




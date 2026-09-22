import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on load
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          const res = await api.auth.me(savedToken);
          if (res.success) {
            setUser(res.user);
            sessionStorage.setItem('user', JSON.stringify(res.user));
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error('Session verification failed, using offline fallback');
          // If server is offline temporarily, fallback to local storage
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  // Poll session validity and user attributes (suspensions/kitchen status) every 3 seconds
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const savedToken = sessionStorage.getItem('token');
      if (!savedToken) return;
      try {
        const res = await api.auth.me(savedToken);
        if (res.success) {
          if (res.user.status === 'Suspended') {
            logout();
          } else {
            setUser((prev) => {
              if (!prev) return null;
              if (JSON.stringify(prev) !== JSON.stringify(res.user)) {
                sessionStorage.setItem('user', JSON.stringify(res.user));
                return res.user;
              }
              return prev;
            });
          }
        } else {
          logout();
        }
      } catch (err) {
        // Silently skip backend connectivity errors during poll
      }
    };

    const interval = setInterval(checkSession, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        setLoading(false);
        return { success: false, error: res.error || 'Invalid credentials' };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'Cannot connect to backend server' };
    }
  };

  const register = async (name, email, password, role, additionalData = {}) => {
    setLoading(true);
    try {
      const res = await api.auth.register(name, email, password, role, additionalData);
      if (res.success) {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        setLoading(false);
        return { success: false, error: res.error || 'Registration failed' };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'Cannot connect to backend server' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      sessionStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const updateProfileDetails = async (profileData) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.auth.updateProfile(profileData, token);
      if (res.success) {
        setUser(res.user);
        sessionStorage.setItem('user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update profile details' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateProfileAddress = async (hostel, room, phone) => {
    return await updateProfileDetails({ hostel, room, phone });
  };

  const deposit = async (amount) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.auth.depositWallet(amount, token);
      if (res.success) {
        setUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, wallet: res.wallet };
          sessionStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to deposit money' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const withdraw = async (amount) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.auth.withdrawWallet(amount, token);
      if (res.success) {
        setUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, wallet: res.wallet };
          sessionStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to withdraw money' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const getWalletTransactions = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.auth.walletTransactions(token);
      if (res.success) {
        return { success: true, transactions: res.transactions };
      }
      return { success: false, error: res.error || 'Failed to fetch transactions' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, updateProfileAddress, updateProfileDetails, deposit, withdraw, getWalletTransactions }}>
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

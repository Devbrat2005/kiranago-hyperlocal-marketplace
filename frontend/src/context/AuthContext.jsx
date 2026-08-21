import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kiranago_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('kiranago_token') || '');
  const [loading, setLoading] = useState(true);

  // Parse URL query token from OAuth redirect flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        setToken(queryToken);
        localStorage.setItem('kiranago_token', queryToken);
        // Clean URL query params without full page reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Check auth persistence on mount / token change
  useEffect(() => {
    const checkAuthSession = async () => {
      const savedToken = localStorage.getItem('kiranago_token') || token;
      try {
        const headers = {};
        if (savedToken) {
          headers['Authorization'] = `Bearer ${savedToken}`;
        }
        const res = await fetch(getApiUrl('/api/auth/me'), {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('kiranago_user', JSON.stringify(data.user));
        } else if (savedToken) {
          setUser(null);
          setToken('');
          localStorage.removeItem('kiranago_user');
          localStorage.removeItem('kiranago_token');
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthSession();
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kiranago_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kiranago_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('kiranago_token', token);
    } else {
      localStorage.removeItem('kiranago_token');
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('kiranago_token', authToken);
    }
    localStorage.setItem('kiranago_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(getApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {}

    setUser(null);
    setToken('');
    localStorage.removeItem('kiranago_user');
    localStorage.removeItem('kiranago_token');
  };

  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('kiranago_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

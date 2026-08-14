import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kiranago_user');
    return saved ? JSON.parse(saved) : {
      id: 'cust_demo_1',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      role: 'CUSTOMER',
      addresses: [
        { id: 'addr_1', type: 'Home', area: 'Indiranagar', city: 'Bengaluru', pincode: '560038', lat: 12.9784, lng: 77.6408, isDefault: true }
      ]
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('kiranago_token') || 'demo_jwt_token_2026');

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
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kiranago_user');
    localStorage.removeItem('kiranago_token');
  };

  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

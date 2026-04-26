import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me().then(d => setUser(d.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const d = await auth.login(username, password);
    setUser(d.user);
    return d;
  }, []);

  const register = useCallback(async (username, password) => {
    const d = await auth.register(username, password);
    setUser(d.user);
    return d;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  const updateSettings = useCallback(async (settings) => {
    await auth.updateSettings(settings);
    setUser(prev => ({ ...prev, settings }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

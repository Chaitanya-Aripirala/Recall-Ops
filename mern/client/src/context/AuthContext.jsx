import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('recallops_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('recallops_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .getMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('recallops_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('recallops_token');
        localStorage.removeItem('recallops_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('recallops_token', data.token);
    localStorage.setItem('recallops_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('recallops_token', data.token);
    localStorage.setItem('recallops_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('recallops_token');
    localStorage.removeItem('recallops_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

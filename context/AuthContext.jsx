import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearAuthToken, setAuthToken } from '../lib/api';
import { getItem, removeItem, setItem } from '../lib/storage';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = await getItem('lux-token');

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        // Mesmo fluxo do projeto original: token salvo -> /auth/me.
        const response = await api.get('/auth/me');
        if (mounted) setAdmin(response.data?.admin || null);
      } catch {
        clearAuthToken();
        await removeItem('lux-token');
        if (mounted) setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();
    return () => { mounted = false; };
  }, []);

  const login = async (username, password) => {
    const cleanUsername = String(username || '').trim();

    if (!cleanUsername || !password) {
      return { success: false, message: `${t.username} / ${t.password}` };
    }

    try {
      // Contrato original preservado: POST /auth/login { username, password }.
      const response = await api.post('/auth/login', {
        username: cleanUsername,
        password,
      });

      const token = response.data?.token;
      const adminData = response.data?.admin;

      if (!token) {
        return { success: false, message: t.apiUnavailable };
      }

      // Nunca coloque token fixo no código. O token real vem da API.
      const stored = await setItem('lux-token', token);
      if (!stored) {
        return { success: false, message: t.apiUnavailable };
      }
      setAuthToken(token);
      setAdmin(adminData || null);

      return { success: true };
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      return {
        success: false,
        message:
          message ||
          (status === 401 ? t.invalidCredentials : t.apiUnavailable),
      };
    }
  };

  const logout = async () => {
    clearAuthToken();
    await removeItem('lux-token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        api,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

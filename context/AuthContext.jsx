import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  api,
  clearAuthToken,
  clearCommunityAuthToken,
  setAuthToken,
  setCommunityAuthToken,
} from '../lib/api';
import { getItem, removeItem, setItem } from '../lib/storage';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const adminToken = await getItem('lux-token');
      const communityToken = await getItem('lux-community-token');

      if (adminToken) {
        try {
          setAuthToken(adminToken);
          const response = await api.get('/auth/me');
          if (mounted) {
            setAdmin(response.data?.admin || null);
            setUserRole('admin');
          }
        } catch {
          await removeItem('lux-token');
          clearAuthToken();
        }
      }

      if (communityToken) {
        try {
          setCommunityAuthToken(communityToken);
          const response = await api.get('/community/auth/me');
          const role = response.data?.role || null;

          if (mounted) {
            setCurrentUser(response.data?.user || response.data?.admin || null);
            setUserRole(role);

            if (role === 'admin') {
              setAdmin(response.data?.admin || null);
              setAuthToken(communityToken);
              await setItem('lux-token', communityToken);
            }
          }
        } catch {
          await removeItem('lux-community-token');
          clearCommunityAuthToken();
        }
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username, password) => {
    const u = String(username || '').trim();

    if (!u || !password) {
      return { success: false, message: `${t.username} / ${t.password}` };
    }

    try {
      const response = await api.post('/auth/login', { username: u, password });
      const token = response.data?.token;

      if (!token) {
        return { success: false, message: t.apiUnavailable };
      }

      await removeItem('lux-community-token');
      clearCommunityAuthToken();
      await setItem('lux-token', token);
      setAuthToken(token);
      setAdmin(response.data?.admin || null);
      setCurrentUser(null);
      setUserRole('admin');

      return { success: true, role: 'admin' };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          (error?.response?.status === 401 ? t.invalidCredentials : t.apiUnavailable),
      };
    }
  };

  const loginUser = async (username, password) => {
    const u = String(username || '').trim();

    if (!u || !password) {
      return { success: false, message: `${t.username} / ${t.password}` };
    }

    try {
      const response = await api.post('/community/auth/login', { username: u, password });
      const token = response.data?.token;
      const role = response.data?.role || null;

      if (!token) {
        return { success: false, message: t.apiUnavailable };
      }

      await setItem('lux-community-token', token);
      setCommunityAuthToken(token);
      setCurrentUser(response.data?.user || response.data?.admin || null);
      setUserRole(role);

      if (role === 'admin') {
        await setItem('lux-token', token);
        setAuthToken(token);
        setAdmin(response.data?.admin || null);
      } else {
        await removeItem('lux-token');
        clearAuthToken();
        setAdmin(null);
      }

      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          (error?.response?.status === 401 ? t.invalidCredentials : t.apiUnavailable),
      };
    }
  };

  const clearSession = async () => {
    clearAuthToken();
    clearCommunityAuthToken();
    await Promise.all([removeItem('lux-token'), removeItem('lux-community-token')]);
    setAdmin(null);
    setCurrentUser(null);
    setUserRole(null);
  };

  const logout = clearSession;
  const logoutUser = clearSession;

  return (
    <AuthContext.Provider
      value={{
        admin,
        currentUser,
        userRole,
        loading,
        login,
        loginUser,
        logout,
        logoutUser,
        api,
        isAuthenticated: !!admin,
        isUserAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}

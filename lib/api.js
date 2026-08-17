import axios from 'axios';
import { API_URL } from '../constants/config';
import { getItem } from './storage';

let authToken = null;

export function setAuthToken(token) {
  authToken = token ? String(token) : null;
}

export function clearAuthToken() {
  authToken = null;
}

export function getAuthToken() {
  return authToken;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
  timeout: 25000,
});

api.interceptors.request.use(async (config) => {
  const method = String(config.method || 'get').toLowerCase();
  const url = String(config.url || '');

  // The in-memory token is used first so a freshly completed login can make
  // an authenticated request immediately, without waiting for storage.
  const token = authToken || await getItem('lux-token');

  config.headers = config.headers || {};
  config.headers.Accept = 'application/json';

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Login itself must never receive a previous Bearer token.
  if (token && !url.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A rejected token is no longer useful. Clear the in-memory copy so the
    // next request falls back to the persisted session or re-authenticates.
    if (error?.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export function unwrapList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function unwrapObject(response, key) {
  const data = response?.data;
  return data?.[key] ?? data?.data ?? data ?? null;
}

export function apiMessage(error, fallback = 'Não foi possível conectar à API do luxjson.') {
  return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

export function isBrowserCorsError(error) {
  return typeof window !== 'undefined' && !error?.response && (error?.request || /Network Error|CORS|cross-origin/i.test(String(error?.message || '')));
}

import axios from 'axios';
import { API_URL } from '../constants/config';
import { getItem, removeItem } from './storage';

let authToken = null;
let communityAuthToken = null;

export function setAuthToken(token) {
  authToken = token ? String(token) : null;
}

export function clearAuthToken() {
  authToken = null;
}

export function setCommunityAuthToken(token) {
  communityAuthToken = token ? String(token) : null;
}

export function clearCommunityAuthToken() {
  communityAuthToken = null;
}

export function getAuthToken() {
  return authToken;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 25000,
});

api.interceptors.request.use(
  async (config) => {
    const method = String(config.method || 'get').toLowerCase();
    const url = String(config.url || '');

    const isCommunity = url.includes('/community');
    const isLogin = url.endsWith('/auth/login');

    let token = null;

    if (isCommunity) {
      /*
       * A comunidade usa SOMENTE o token da comunidade.
       * Não usamos lux-token como fallback porque ele pode
       * ter sido emitido por outro sistema/middleware.
       */
      token =
        communityAuthToken ||
        (await getItem('lux-community-token'));
    } else {
      /*
       * A API principal usa o token principal.
       */
      token =
        authToken ||
        (await getItem('lux-token'));
    }

    config.headers = config.headers || {};

    config.headers.Accept = 'application/json';

    if (
      ['post', 'put', 'patch', 'delete'].includes(method)
    ) {
      config.headers['Content-Type'] = 'application/json';
    }

    /*
     * Login nunca deve receber um Bearer antigo.
     */
    if (token && !isLogin) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');

    if (status === 401) {
      const isCommunity = url.includes('/community');

      if (isCommunity) {
        clearCommunityAuthToken();

        try {
          await removeItem('lux-community-token');
        } catch (storageError) {
          console.warn(
            'Não foi possível remover o token da comunidade:',
            storageError
          );
        }
      } else {
        clearAuthToken();

        try {
          await removeItem('lux-token');
        } catch (storageError) {
          console.warn(
            'Não foi possível remover o token principal:',
            storageError
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export function unwrapList(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.posts)) {
    return data.posts;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export function unwrapObject(response, key) {
  const data = response?.data;

  return data?.[key] ?? data?.data ?? data ?? null;
}

export function apiMessage(
  error,
  fallback = 'Não foi possível conectar à API do luxjson.'
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
}

export function isBrowserCorsError(error) {
  return (
    typeof window !== 'undefined' &&
    !error?.response &&
    (
      error?.request ||
      /Network Error|CORS|cross-origin/i.test(
        String(error?.message || '')
      )
    )
  );
}


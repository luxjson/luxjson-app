import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_PREFIX = 'luxjson:';

// A chave da API do itch.io permanece apenas em memória no Web.
// Os tokens de sessão são persistidos no Web para manter o mesmo comportamento
// de sessão após recarregar a aplicação, enquanto no nativo continuam no
// Keychain/Keystore via expo-secure-store.
const WEB_MEMORY_ONLY_KEYS = new Set(['itch-api-key']);

function webKey(key) {
  return `${WEB_PREFIX}${key}`;
}

export async function getItem(key) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      if (WEB_MEMORY_ONLY_KEYS.has(key)) return null;
      return window.localStorage.getItem(webKey(key));
    }

    return await SecureStore.getItemAsync(key);
  } catch (error) {
    if (__DEV__) console.warn(`[storage] getItem failed for ${key}:`, error?.message || error);
    return null;
  }
}

export async function setItem(key, value) {
  const stringValue = String(value ?? '');

  try {
    if (Platform.OS === 'web') {
      if (WEB_MEMORY_ONLY_KEYS.has(key)) return false;
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(webKey(key), stringValue);
      return true;
    }

    await SecureStore.setItemAsync(key, stringValue);
    return true;
  } catch (error) {
    if (__DEV__) console.warn(`[storage] setItem failed for ${key}:`, error?.message || error);
    return false;
  }
}

export async function removeItem(key) {
  try {
    if (Platform.OS === 'web') {
      if (WEB_MEMORY_ONLY_KEYS.has(key)) return false;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(webKey(key));
      }
      return true;
    }

    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    if (__DEV__) console.warn(`[storage] removeItem failed for ${key}:`, error?.message || error);
    return false;
  }
}

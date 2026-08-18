import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_PREFIX = 'luxjson:';

// Chaves sensíveis que NUNCA devem ser persistidas em localStorage no Web:
// localStorage é acessível por qualquer script no mesmo domínio (sem isolamento,
// sem flag httpOnly), então um XSS conseguiria ler o token de sessão ou a API key
// do itch.io diretamente. No Web, essas chaves ficam só em memória (module-level
// map) e são perdidas ao fechar a aba/app — no nativo continuam protegidas pelo
// Keychain/Keystore via expo-secure-store normalmente.
const WEB_MEMORY_ONLY_KEYS = new Set(['lux-token', 'itch-api-key']);
const webMemoryStore = new Map();

function webKey(key) {
  return `${WEB_PREFIX}${key}`;
}

export async function getItem(key) {
  try {
    if (Platform.OS === 'web') {
      if (WEB_MEMORY_ONLY_KEYS.has(key)) return webMemoryStore.get(key) ?? null;
      if (typeof window === 'undefined' || !window.localStorage) return null;
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
      if (WEB_MEMORY_ONLY_KEYS.has(key)) {
        webMemoryStore.set(key, stringValue);
        return true;
      }
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
      if (WEB_MEMORY_ONLY_KEYS.has(key)) {
        webMemoryStore.delete(key);
        return true;
      }
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

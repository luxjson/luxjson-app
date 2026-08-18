// Backend oficial do luxjson. Não altere para localhost ou outro domínio.
export const API_URL = 'https://api.luxjson.is-a.dev/api';

export const GITHUB_USER = 'luxjson';

// Nunca coloque credenciais reais aqui como fallback — configure via .env
// (EXPO_PUBLIC_EMAILJS_*). Ver lib/email.js para a validação de boot.
export const EMAILJS_SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || '';
export const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || '';
export const EMAILJS_PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export const SUPPORT_PIX_KEY = process.env.EXPO_PUBLIC_PIX_KEY || '';

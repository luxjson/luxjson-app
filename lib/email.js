import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from '../constants/config';

export async function sendContactEmail({ name, email, subject = '', message }) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error('EmailJS não configurado: defina EXPO_PUBLIC_EMAILJS_SERVICE_ID, EXPO_PUBLIC_EMAILJS_TEMPLATE_ID e EXPO_PUBLIC_EMAILJS_PUBLIC_KEY no .env');
  }

  const clean = {
    name: String(name ?? '').trim(),
    email: String(email ?? '').trim(),
    subject: String(subject ?? '').trim(),
    message: String(message ?? '').trim(),
  };
  if (!clean.name || !clean.email || !clean.message) throw new Error('Missing contact fields');

  // Keep the exact field names used by the original Vite implementation's
  // HTML form (user_name/user_email), while also exposing common aliases.
  const template_params = {
    user_name: clean.name,
    user_email: clean.email,
    from_name: clean.name,
    from_email: clean.email,
    reply_to: clean.email,
    sender_name: clean.name,
    sender_email: clean.email,
    name: clean.name,
    email: clean.email,
    subject: clean.subject,
    message: clean.message,
  };

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || 'EmailJS request failed');
  }
  return true;
}

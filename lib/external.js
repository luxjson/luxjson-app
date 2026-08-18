import { Linking } from 'react-native';

export async function openExternal(url) {
  if (!url) return false;

  try {
    const finalUrl = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    await Linking.openURL(finalUrl);
    return true;
  } catch (error) {
    if (__DEV__) console.warn('[LuxJSON] Erro ao abrir link:', finalUrl, error);
    return false;
  }
}
import { Alert, Platform } from 'react-native';

export function showAlert(title, message = '') {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${title}${message ? `\n\n${message}` : ''}`);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAlert(title, message = '', options = {}) {
  const { confirmText = 'OK', cancelText = 'Cancelar' } = options;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
    return Promise.resolve(window.confirm(`${title}${message ? `\n\n${message}` : ''}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

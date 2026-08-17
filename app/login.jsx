import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Screen from '../components/Screen';
import BackButton from '../components/BackButton';
import { AppText, DisplayText } from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { theme } = useTheme(); const { t } = useLanguage(); const { login } = useAuth(); const router = useRouter();
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => { setBusy(true); setError(''); const result = await login(username, password); setBusy(false); if (result.success) router.replace('/admin'); else setError(result.message); };
  return <Screen><KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}><View style={[styles.logo, { backgroundColor: theme.primary }]}><MaterialIcons name="lock" size={32} color={theme.onPrimary} /></View><DisplayText style={styles.title}>luxjson</DisplayText><AppText muted style={styles.sub}>{t.loginTitle}</AppText><TextInput value={username} onChangeText={setUsername} placeholder={t.username} placeholderTextColor={theme.onSurfaceVariant} autoCapitalize="none" style={[styles.input, { color: theme.onSurface, backgroundColor: theme.surface, borderColor: theme.surfaceVariant }]} /><TextInput value={password} onChangeText={setPassword} placeholder={t.password} placeholderTextColor={theme.onSurfaceVariant} secureTextEntry style={[styles.input, { color: theme.onSurface, backgroundColor: theme.surface, borderColor: theme.surfaceVariant }]} />{error ? <AppText style={{ color: theme.error }}>{error}</AppText> : null}<Pressable disabled={busy} onPress={submit} style={[styles.button, { backgroundColor: theme.primary, opacity: busy ? .6 : 1 }]}><AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{busy ? t.entering : t.login}</AppText></Pressable><BackButton fallback="/(tabs)/settings" /></View></KeyboardAvoidingView></Screen>;
}
const styles = StyleSheet.create({ wrap: { flex: 1, justifyContent: 'center', padding: 18 }, card: { borderWidth: 1, borderRadius: 32, padding: 24, gap: 14 }, logo: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 38 }, sub: { marginTop: -8, marginBottom: 8 }, input: { height: 54, borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, fontFamily: 'LuxPoppins' }, button: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 2 } });

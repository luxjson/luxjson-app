import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import { AppText, DisplayText } from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const router = useRouter(); const { theme } = useTheme(); const { t } = useLanguage();
  return <Screen><AppHeader title="luxjson" /><View style={styles.wrap}><DisplayText style={styles.code}>404</DisplayText><AppText muted>{t.notFound}</AppText><Pressable onPress={() => router.replace('/')} style={[styles.button, { backgroundColor: theme.primary }]}><MaterialIcons name="home" size={20} color={theme.onPrimary} /><AppText style={{ color: theme.onPrimary }}>{t.goHome}</AppText></Pressable></View></Screen>;
}
const styles = StyleSheet.create({ wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }, code: { fontSize: 100 }, button: { minHeight: 52, borderRadius: 26, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 } });

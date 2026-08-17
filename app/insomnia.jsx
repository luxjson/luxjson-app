import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Screen from '../components/Screen';
import { AppText, DisplayText } from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { openExternal } from '../lib/external';
import { useLanguage } from '../context/LanguageContext';

export default function Insomnia() {
  const { theme } = useTheme();
  const { t } = useLanguage(); const router = useRouter();
  return <Screen><ScrollView contentContainerStyle={styles.container}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={22} color={theme.primary} /><AppText style={{ color: theme.primary }}>{t.back}</AppText></Pressable><View style={[styles.hero, { backgroundColor: theme.onSurface }]}><Image source={require('../assets/images/logo.jpg')} style={styles.image} /><DisplayText style={[styles.title, { color: theme.surface }]}>{t.insomnia}</DisplayText><AppText style={[styles.slogan, { color: theme.surfaceVariant }]}>{t.insomniaSlogan}</AppText></View><View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}><AppText style={styles.heading}>{t.project}</AppText><AppText muted style={styles.body}>{t.insomniaDesc}</AppText><Pressable onPress={() => openExternal('https://somiari.itch.io/insomnia')} style={[styles.button, { backgroundColor: theme.primary }]}><AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{t.openInsomnia}</AppText><MaterialIcons name="open-in-new" size={19} color={theme.onPrimary} /></Pressable></View></ScrollView></Screen>;
}
const styles = StyleSheet.create({ container: { padding: 18, paddingBottom: 100, gap: 16 }, back: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44 }, hero: { borderRadius: 30, padding: 22, minHeight: 330, justifyContent: 'flex-end', gap: 12 }, image: { width: '100%', height: 160, borderRadius: 22, opacity: .82 }, title: { fontSize: 48 }, slogan: { fontSize: 15, lineHeight: 22 }, card: { borderWidth: 1, borderRadius: 28, padding: 22, gap: 14 }, heading: { fontFamily: 'LuxPoppinsBold', letterSpacing: 2 }, body: { fontSize: 15, lineHeight: 23 }, button: { minHeight: 52, borderRadius: 26, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } });

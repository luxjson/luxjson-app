import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import BrandIconButton from '../../components/BrandIconButton';
import IconButton from '../../components/IconButton';
import InfoSheet from '../../components/InfoSheet';
import { AppText, DisplayText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { openExternal } from '../../lib/external';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [info, setInfo] = React.useState(false);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <AppHeader title="luxjson" />

        <View style={[styles.hero, { backgroundColor: theme.primaryContainer }]}>
          <AppText style={[styles.eyebrow, { color: theme.primary }]}>{t.work}</AppText>
          <DisplayText style={styles.heroTitle}>{t.hero}</DisplayText>
          <AppText muted style={styles.heroDesc}>{t.desc}</AppText>
          <Pressable onPress={() => router.push('/(tabs)/projects')} style={({ pressed }) => [styles.primary, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
            <AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{t.projects}</AppText>
            <MaterialIcons name="arrow-forward" size={20} color={theme.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          <Quick icon="code" title={t.projects} desc={t.projectsDesc} onPress={() => router.push('/(tabs)/projects')} theme={theme} />
          <Quick icon="sports-esports" title={t.games} desc={t.gamesDesc} onPress={() => router.push('/(tabs)/games')} theme={theme} />
          <Quick icon="article" title={t.blog} desc={t.blogDesc} onPress={() => router.push('/(tabs)/blog')} theme={theme} />
          <Quick icon="tune" title={t.settings} desc={t.settingsDesc} onPress={() => router.push('/(tabs)/settings')} theme={theme} />
        </View>

        <View style={[styles.dead, { backgroundColor: theme.onSurface }]}>
          <View style={styles.deadTop}>
            <View style={[styles.deadIcon, { backgroundColor: theme.primary }]}><MaterialIcons name="sports-esports" size={25} color={theme.onPrimary} /></View>
            <AppText style={{ color: theme.surfaceVariant, fontSize: 11 }}>{t.games}</AppText>
          </View>
          <DisplayText style={[styles.deadTitle, { color: theme.surface }]}>{t.dead}</DisplayText>
          <AppText style={{ color: theme.surfaceVariant, lineHeight: 21 }}>{t.deadDesc}</AppText>
          <Pressable onPress={() => router.push('/(tabs)/games')} style={[styles.deadButton, { borderColor: theme.surfaceVariant }]}>
            <AppText style={{ color: theme.surface }}>{t.games}</AppText>
            <MaterialIcons name="arrow-forward" size={18} color={theme.surface} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <DisplayText style={styles.socialTitle}>luxjson</DisplayText>
          <AppText muted style={{ textAlign: 'center' }}>{t.homeShort}</AppText>
          <View style={styles.socialRow}>
            <BrandIconButton icon="github" onPress={() => openExternal('https://github.com/luxjson')} accessibilityLabel="GitHub" />
            <BrandIconButton icon="instagram" onPress={() => openExternal('https://instagram.com/luxjson')} accessibilityLabel="Instagram" />
            <BrandIconButton icon="linkedin" onPress={() => openExternal('https://www.linkedin.com/company/luxjson')} accessibilityLabel="LinkedIn" />
            <IconButton icon="info-outline" onPress={() => setInfo(true)} accessibilityLabel={t.info} />
          </View>
        </View>
      </ScrollView>
      <InfoSheet visible={info} onClose={() => setInfo(false)} />
    </Screen>
  );
}

function Quick({ icon, title, desc, onPress, theme }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }, pressed && styles.pressed]}>
      <View style={[styles.quickIcon, { backgroundColor: theme.primaryContainer }]}><MaterialIcons name={icon} size={21} color={theme.primary} /></View>
      <AppText style={styles.quickTitle}>{title}</AppText>
      <AppText muted numberOfLines={2} style={styles.quickDesc}>{desc}</AppText>
      <MaterialIcons name="arrow-outward" size={18} color={theme.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 125, gap: 18 },
  hero: { borderRadius: 32, padding: 24, minHeight: 350, justifyContent: 'flex-end', gap: 14 },
  eyebrow: { letterSpacing: 2, fontSize: 12 },
  heroTitle: { fontSize: 42, lineHeight: 45 },
  heroDesc: { fontSize: 15, lineHeight: 22, maxWidth: 340 },
  primary: { minHeight: 54, borderRadius: 27, paddingHorizontal: 20, marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quick: { width: '48%', minHeight: 165, borderWidth: 1, borderRadius: 26, padding: 16, gap: 8 },
  quickIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 17 },
  quickDesc: { fontSize: 12, lineHeight: 17, flex: 1 },
  dead: { borderRadius: 30, padding: 22, gap: 12 },
  deadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  deadTitle: { fontSize: 35 },
  deadButton: { borderWidth: 1, minHeight: 48, borderRadius: 24, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footer: { alignItems: 'center', gap: 7, paddingVertical: 16 },
  socialTitle: { fontSize: 31 },
  socialRow: { flexDirection: 'row', gap: 9, marginTop: 6 },
  infoLink: { fontSize: 11 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});

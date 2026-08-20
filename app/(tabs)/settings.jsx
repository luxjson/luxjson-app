import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import ServerStatusCard from '../../components/ServerStatusCard';
import { AppText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { openExternal } from '../../lib/external';

export default function Settings() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const items = useMemo(() => [
    ['appearance', 'palette', t.customization, t.customizationDesc, `${t.theme} ${t.materialYou} ${t.accent}`],
    ['language', 'language', t.language, t.languageDesc, `${t.portuguese} ${t.english} ${t.spanish}`],
    ['connections', 'link', t.connectionsTitle, t.connectionsDesc, `${t.github} ${t.itch}`],
    ['admin', 'admin-panel-settings', t.adminTitle, t.adminDesc, t.adminArea],
    ['support', 'favorite-border', t.supportTitle, t.supportDesc, `${t.supportItch} ${t.supportGithub}`],
    ['links', 'public', t.linksTitle, t.linksDesc, `${t.portfolio} ${t.apiSite} ${t.docs}`],
  ], [t]);

  const normalized = query.trim().toLocaleLowerCase();
  const visible = normalized
    ? items.filter(([, , title, desc, keywords]) => `${title} ${desc} ${keywords}`.toLocaleLowerCase().includes(normalized))
    : items;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
        <AppHeader title={t.settings} />

        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
          <MaterialIcons name="search" size={21} color={theme.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchSettings}
            placeholderTextColor={theme.onSurfaceVariant}
            style={[styles.searchInput, { color: theme.onSurface }]}
            returnKeyType="search"
          />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><MaterialIcons name="close" size={20} color={theme.onSurfaceVariant} /></Pressable> : null}
        </View>

        <ServerStatusCard />

        <View style={styles.list}>
          {visible.map(([id, icon, title, desc]) => (
            <SettingCard key={id} icon={icon} title={title} desc={desc} theme={theme} onPress={() => router.push(`/settings/${id}`)} />
          ))}
        </View>

        {!visible.length ? (
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={42} color={theme.onSurfaceVariant} />
            <AppText muted>{t.noResults}</AppText>
          </View>
        ) : null}

        <View style={styles.footerLinks}>
          <Pressable onPress={() => openExternal('https://luxjson.is-a.dev')}><AppText muted style={styles.footerLink}>{t.portfolio}</AppText></Pressable>
          <View style={[styles.dot, { backgroundColor: theme.outline }]} />
          <Pressable onPress={() => openExternal('https://api.luxjson.is-a.dev')}><AppText muted style={styles.footerLink}>{t.apiSite}</AppText></Pressable>
        </View>
        <AppText muted style={styles.version}>Version 1.0.1</AppText>
      </ScrollView>
    </Screen>
  );
}

function SettingCard({ icon, title, desc, theme, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}><MaterialIcons name={icon} size={22} color={theme.primary} /></View>
      <View style={styles.copy}><AppText style={styles.title}>{title}</AppText><AppText muted style={styles.desc}>{desc}</AppText></View>
      <MaterialIcons name="chevron-right" size={24} color={theme.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 135, gap: 15 },
  search: { height: 52, borderWidth: 1, borderRadius: 26, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontFamily: 'LuxFirsNeue', fontSize: 14 },
  list: { gap: 11 },
  card: { minHeight: 78, borderWidth: 1, borderRadius: 25, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 16 },
  desc: { fontSize: 11, lineHeight: 16 },
  empty: { alignItems: 'center', gap: 10, padding: 40 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingTop: 8 },
  footerLink: { fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  version: { textAlign: 'center', fontSize: 10, paddingBottom: 4 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.992 }] },
});

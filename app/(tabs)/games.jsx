import { Image, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import SectionHeader from '../../components/SectionHeader';
import LoadingView from '../../components/LoadingView';
import { AppText, DisplayText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_ITCH_USER, fetchPublicItchGames, itchProfileUrl } from '../../lib/itch';
import { openExternal } from '../../lib/external';

export default function Games() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const publicGames = await fetchPublicItchGames(DEFAULT_ITCH_USER);
      setGames(publicGames);
    } catch {
      setGames([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <FlatList
        data={games}
        keyExtractor={(item, index) => String(item.id || item.url || index)}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onRefresh={load}
        refreshing={loading}
        ListHeaderComponent={
          <>
            <AppHeader title={t.games} />
            <SectionHeader eyebrow="ITCH.IO" title={t.games} description={t.gamesDesc} />
            <Pressable
              onPress={() => openExternal(itchProfileUrl(DEFAULT_ITCH_USER))}
              style={[styles.profile, { backgroundColor: theme.primaryContainer }]}
            >
              <View style={{ flex: 1 }}>
                <AppText style={{ color: theme.primary, fontFamily: 'LuxFirsNeue' }}>DEADSMILE</AppText>
                <AppText muted style={{ marginTop: 2 }}>deadsml.itch.io</AppText>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
            </Pressable>
            {error ? (
              <View style={[styles.error, { backgroundColor: theme.error + '12' }]}>
                <AppText style={{ color: theme.error }}>{t.noGames}</AppText>
                <Pressable onPress={load} style={[styles.retry, { backgroundColor: theme.error }]}>
                  <AppText style={{ color: theme.onError, fontWeight: '700' }}>{t.retry || 'Retry'}</AppText>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ height: 220 }}><LoadingView label={t.loadingProjects} /></View>
          ) : (
            <View style={styles.empty}>
              <MaterialIcons name="sports-esports" size={48} color={theme.onSurfaceVariant} />
              <AppText muted>{t.noGames}</AppText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openExternal(item.url)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.surfaceVariant },
              pressed && { opacity: .86, transform: [{ scale: .99 }] },
            ]}
          >
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, { backgroundColor: theme.primaryContainer }]}>
                <MaterialIcons name="sports-esports" size={44} color={theme.primary} />
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <DisplayText numberOfLines={1} style={styles.title}>{item.title}</DisplayText>
                <MaterialIcons name="open-in-new" size={19} color={theme.primary} />
              </View>
              {item.short_text ? <AppText muted numberOfLines={3}>{item.short_text}</AppText> : null}
              <AppText style={{ color: theme.primary, fontSize: 11, fontFamily: 'LuxFirsNeue' }}>{t.publishedGames}</AppText>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 130 },
  profile: { borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 26, overflow: 'hidden', marginBottom: 14 },
  cover: { height: 150, width: '100%', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 17, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, flex: 1 },
  error: { padding: 14, borderRadius: 18, marginBottom: 12, gap: 10 },
  retry: { alignSelf: 'flex-start', minHeight: 40, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 12, padding: 45 },
});

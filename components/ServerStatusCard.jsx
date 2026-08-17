import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { AppText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../constants/config';

export default function ServerStatusCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  const check = useCallback(async () => {
    setStatus('checking');
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${API_URL}/blog/posts?limit=1&publishedOnly=true`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      // Any valid HTTP response means the server is reachable, including 4xx/5xx.
      setStatus(response.status >= 100 && response.status < 600 ? 'live' : 'down');
      setLatency(Date.now() - started);
    } catch {
      setStatus('down');
      setLatency(null);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const live = status === 'live';
  const checking = status === 'checking';
  const color = checking ? theme.onSurfaceVariant : live ? theme.success : theme.error;
  const label = checking ? t.checking : live ? t.live : t.down;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: checking ? theme.surfaceVariant : live ? theme.success + '20' : theme.error + '18' }]}>
          {checking ? <ActivityIndicator size="small" color={theme.primary} /> : <MaterialIcons name={live ? 'cloud-done' : 'cloud-off'} size={22} color={color} />}
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>{t.serverStatus}</AppText>
          <AppText muted style={styles.endpoint}>{t.serverEndpoint}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <AppText style={{ color, fontSize: 11 }}>{label}</AppText>
        </View>
      </View>
      <View style={styles.bottom}>
        <AppText muted style={styles.description}>{checking ? t.checking : live ? t.serverLiveDesc : t.serverDownDesc}</AppText>
        {latency !== null ? <AppText muted style={styles.latency}>{latency} ms</AppText> : null}
        <Pressable onPress={check} hitSlop={8} accessibilityLabel={t.refresh}>
          <MaterialIcons name="refresh" size={20} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 26, padding: 17, gap: 13 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  endpoint: { fontSize: 11 },
  badge: { minHeight: 30, paddingHorizontal: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  description: { flex: 1, fontSize: 11, lineHeight: 16 },
  latency: { fontSize: 10 },
});

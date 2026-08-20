import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ActivityIndicator, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const RELEASES_URL = 'https://api.github.com/repos/luxjson/luxjson-app/releases/latest';
const DOWNLOAD_URL = 'https://github.com/luxjson/luxjson-app/releases/latest';
const REQUEST_TIMEOUT = 7000;

function normalizeVersion(value = '') {
  const match = String(value).trim().replace(/^v/i, '').match(/\d+(?:\.\d+){0,2}/);
  if (!match) return null;
  return match[0].split('.').map(Number).concat([0, 0]).slice(0, 3);
}

function isNewerVersion(latest, current) {
  const a = normalizeVersion(latest);
  const b = normalizeVersion(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

export default function UpdateChecker() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [update, setUpdate] = useState(null);
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(RELEASES_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: controller.signal,
      });

      if (!response.ok) return;
      const release = await response.json();
      if (release?.draft || release?.prerelease || !release?.tag_name) return;

      const currentVersion = Constants.expoConfig?.version || '1.0.1';
      if (!mounted.current || !isNewerVersion(release.tag_name, currentVersion)) return;

      setUpdate({
        version: String(release.tag_name).replace(/^v/i, ''),
        name: release.name || release.tag_name,
      });
    } catch {
      // Update checks are non-critical. Network/API failures must never block the app.
    } finally {
      clearTimeout(timeout);
      if (mounted.current) setChecking(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    checkForUpdate();
    return () => {
      mounted.current = false;
    };
  }, [checkForUpdate]);

  const close = () => setUpdate(null);
  const download = async () => {
    try {
      await Linking.openURL(DOWNLOAD_URL);
    } catch {
      // Ignore external-link failures so the update checker never breaks navigation.
    }
  };

  if (!update) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
          <View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}>
            <MaterialIcons name="system-update" size={28} color={theme.onPrimaryContainer || theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.onSurface }]}>
            {t.updateAvailable || 'Update available'}
          </Text>
          <Text style={[styles.message, { color: theme.onSurfaceVariant }]}>
            {t.updateMessage || 'A new version of luxjson is available.'}
          </Text>

          <View style={[styles.versionBox, { backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.versionLabel, { color: theme.onSurfaceVariant }]}>
              {t.version || 'Version'}
            </Text>
            <Text style={[styles.version, { color: theme.onSurface }]}>
              {update.version}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={close}
              style={({ pressed }) => [styles.secondaryButton, { borderColor: theme.outline, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.secondaryText, { color: theme.primary }]}>
                {t.later || 'Later'}
              </Text>
            </Pressable>

            <Pressable
              onPress={download}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="download" size={19} color={theme.onPrimary || '#FFFFFF'} />
              <Text style={[styles.primaryText, { color: theme.onPrimary || '#FFFFFF' }]}>
                {t.download || 'Download'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    ...Platform.select({ web: { boxShadow: '0 8px 28px rgba(0,0,0,0.22)' }, default: { elevation: 12, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } } }),
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  versionBox: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 22,
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  version: {
    fontSize: 17,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useEffect, useState } from 'react';
import Screen from '../../../components/Screen';
import AppHeader from '../../../components/AppHeader';
import BackButton from '../../../components/BackButton';
import LoadingView from '../../../components/LoadingView';
import { AppText } from '../../../components/AppText';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchReportedPosts, moderatePost } from '../../../lib/communityApi';
import { showAlert } from '../../../lib/ui';

export default function Reports() {
  const { theme } = useTheme();
  const { t, locale } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await fetchReportedPosts();
    setItems(result.success ? result.data || [] : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id, action) => {
    setBusy(id);
    const result = await moderatePost(id, action);
    setBusy(null);

    if (result.success) {
      setItems((current) => current.filter((post) => post.id !== id));
    } else {
      showAlert(t.error, result.message);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppHeader title={t.reportedPosts} />
        <BackButton fallback="/admin" />
      </View>

      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(post, index) => `${post.id}-${post.report_id || index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons
                name="check-circle-outline"
                size={44}
                color={theme.success}
              />
              <AppText muted>{t.noReports}</AppText>
            </View>
          }
          renderItem={({ item: post }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.surfaceVariant,
                },
              ]}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.primaryContainer },
                  ]}
                >
                  <AppText
                    style={{ color: theme.primary, fontWeight: '800' }}
                  >
                    {String(post.author_name || '?').charAt(0).toUpperCase()}
                  </AppText>
                </View>

                <View style={styles.flex}>
                  <AppText style={{ fontWeight: '800' }}>
                    {post.author_name}
                  </AppText>
                  <AppText muted style={styles.meta}>
                    {post.is_admin_post ? 'ADMIN' : `#${post.registration_number}`} ·{' '}
                    {new Date(post.created_at).toLocaleDateString(locale)}
                  </AppText>
                </View>
              </View>

              <AppText style={styles.content}>{post.content}</AppText>

              <View
                style={[
                  styles.reason,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceVariant,
                  },
                ]}
              >
                <AppText muted>{post.report_reason || t.reported}</AppText>
                <AppText muted style={styles.meta}>
                  {post.reporter_name || '—'} ·{' '}
                  {post.reported_at
                    ? new Date(post.reported_at).toLocaleDateString(locale)
                    : ''}
                </AppText>
              </View>

              <View style={styles.actions}>
                <Pressable
                  disabled={busy === post.id}
                  onPress={() => moderate(post.id, 'approve')}
                  style={[
                    styles.action,
                    { backgroundColor: theme.primaryContainer },
                  ]}
                >
                  <MaterialIcons
                    name="check"
                    size={19}
                    color={theme.primary}
                  />
                  <AppText
                    style={{ color: theme.primary, fontWeight: '700' }}
                  >
                    {t.approvePost}
                  </AppText>
                </Pressable>

                <Pressable
                  disabled={busy === post.id}
                  onPress={() => moderate(post.id, 'remove')}
                  style={[
                    styles.action,
                    { backgroundColor: theme.errorContainer },
                  ]}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={19}
                    color={theme.error}
                  />
                  <AppText style={{ color: theme.error, fontWeight: '700' }}>
                    {t.removePost}
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 8,
  },
  list: {
    padding: 18,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 17,
    gap: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  meta: {
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  reason: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
  },
  action: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 70,
  },
});

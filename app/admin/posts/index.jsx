import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../../../components/Screen';
import SectionHeader from '../../../components/SectionHeader';
import { AppText, DisplayText } from '../../../components/AppText';
import LoadingView from '../../../components/LoadingView';
import BackButton from '../../../components/BackButton';
import AppHeader from '../../../components/AppHeader';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function PostsList() {
  const { theme } = useTheme();
  const { t, locale } = useLanguage(); const { api } = useAuth(); const router = useRouter(); const [posts, setPosts] = useState([]); const [loading, setLoading] = useState(true); const [deleting, setDeleting] = useState(null);
  const load = async () => { setLoading(true); try { const r = await api.get('/blog/posts?publishedOnly=false&limit=100'); setPosts((Array.isArray(r.data) ? r.data : (r.data.posts || r.data.data || []))); } catch { Alert.alert(t.error, t.loadError); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const deletePost = async (id) => {
    if (!id || deleting !== null) return;

    setDeleting(id);
    try {
      await api.delete(`/blog/posts/${encodeURIComponent(String(id))}`);
      setPosts(current => current.filter(post => String(post.id) !== String(id)));
    } catch (error) {
      if (__DEV__) console.error('[luxjson] Erro ao excluir post:', error?.response?.data || error?.message || error);
      Alert.alert(t.error, error?.response?.data?.message || t.deleteError);
    } finally {
      setDeleting(null);
    }
  };

  const remove = (id) => {
    if (!id || deleting !== null) return;
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm(`${t.delete}\n\n${t.confirmDelete}`);
      if (confirmed) deletePost(id);
      return;
    }

    Alert.alert(
      t.delete,
      t.confirmDelete,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => deletePost(id) },
      ],
      { cancelable: true },
    );
  };
  if (loading) return <Screen><LoadingView label={t.loadingPosts} /></Screen>;
  return <Screen><FlatList data={posts} keyExtractor={item => String(item.id)} contentContainerStyle={styles.container} ListHeaderComponent={<><AppHeader title={t.adminLabel} /><BackButton fallback="/admin" /><SectionHeader  title={t.allPostsTitle} description={t.allPostsDesc} /><Pressable onPress={() => router.push('/admin/posts/new')} style={[styles.add, { backgroundColor: theme.primary }]}><MaterialIcons name="add" size={20} color={theme.onPrimary} /><AppText style={{ color: theme.onPrimary }}>{t.addPost}</AppText></Pressable></>} renderItem={({ item }) => <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}><View style={styles.row}><DisplayText numberOfLines={2} style={styles.title}>{item.title}</DisplayText><View style={[styles.badge, { backgroundColor: item.published ? theme.primaryContainer : theme.surfaceVariant }]}><AppText style={{ color: item.published ? theme.primary : theme.onSurfaceVariant, fontSize: 11 }}>{item.published ? t.published : t.draft}</AppText></View></View><AppText muted style={styles.date}>{new Date(item.created_at).toLocaleDateString(locale)}</AppText><View style={styles.actions}><Pressable onPress={() => router.push(`/admin/posts/edit/${item.id}`)} style={[styles.action, { backgroundColor: theme.surfaceVariant }]}><MaterialIcons name="edit" size={19} color={theme.onSurface} /><AppText>{t.edit}</AppText></Pressable><Pressable disabled={deleting === item.id} onPress={() => remove(item.id)} style={[styles.action, { backgroundColor: theme.errorContainer || theme.surfaceVariant, opacity: deleting === item.id ? .5 : 1 }]}><MaterialIcons name="delete" size={19} color={theme.error} /><AppText style={{ color: theme.error }}>{deleting === item.id ? t.deleting : t.delete}</AppText></Pressable></View></View>} ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="article" size={48} color={theme.onSurfaceVariant} /><AppText muted>{t.noPosts}</AppText></View>} /></Screen>;
}
const styles = StyleSheet.create({ container: { padding: 18, paddingBottom: 100 }, add: { minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 14 }, card: { borderWidth: 1, borderRadius: 26, padding: 18, marginBottom: 12, gap: 10 }, row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, title: { flex: 1, fontSize: 19 }, badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }, date: { fontSize: 12 }, actions: { flexDirection: 'row', gap: 8 }, action: { minHeight: 42, flex: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }, empty: { alignItems: 'center', gap: 12, padding: 40 } });

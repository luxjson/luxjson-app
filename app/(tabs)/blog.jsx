import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import SectionHeader from '../../components/SectionHeader';
import { AppText, DisplayText } from '../../components/AppText';
import LoadingView from '../../components/LoadingView';
import { useTheme } from '../../context/ThemeContext';
import { api, unwrapList } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

function Card({ post }) {
  const { theme } = useTheme();
  const { t, locale } = useLanguage();
  const router = useRouter();
  return <Pressable onPress={() => router.push(`/blog/${post.slug}`)} style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }, pressed && { opacity: .9 }]}>
    {post.cover_image ? <Image source={{ uri: post.cover_image }} style={styles.cover} /> : <View style={[styles.cover, { backgroundColor: theme.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}><MaterialIcons name="article" size={44} color={theme.primary} /></View>}
    <View style={styles.content}><DisplayText numberOfLines={2} style={styles.title}>{post.title}</DisplayText>{post.excerpt ? <AppText muted numberOfLines={3} style={styles.excerpt}>{post.excerpt}</AppText> : null}<View style={styles.meta}><AppText muted style={styles.metaText}>{new Date(post.published_at || post.created_at).toLocaleDateString(locale)}</AppText>{post.views > 0 ? <AppText muted style={styles.metaText}>◉ {post.views}</AppText> : null}<MaterialIcons name="arrow-forward" size={18} color={theme.primary} /></View></View>
  </Pressable>;
}
export default function Blog() {
  const { theme } = useTheme();
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    api.get('/blog/posts?limit=10&publishedOnly=true')
      .then(r => { setPosts(unwrapList(r)); setError(false); })
      .catch(() => { setPosts([]); setError(true); })
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Screen><LoadingView label={t.loadingPosts} /></Screen>;
  return <Screen><FlatList data={posts} keyExtractor={item => String(item.id || item.slug)} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} ListHeaderComponent={<><AppHeader title={t.blog} /><SectionHeader eyebrow={t.blogLabel} title={t.blogNews} description={t.blogDesc} /></>} renderItem={({ item }) => <Card post={item} />} ListEmptyComponent={<View style={[styles.empty, { backgroundColor: theme.card }]}><MaterialIcons name={error ? 'cloud-off' : 'article'} size={50} color={theme.onSurfaceVariant} /><AppText muted>{error ? t.loadError : t.noPublished}</AppText></View>} /></Screen>;
}
const styles = StyleSheet.create({ container: { padding: 18, paddingBottom: 100 }, card: { borderWidth: 1, borderRadius: 28, overflow: 'hidden', marginBottom: 14 }, cover: { width: '100%', height: 190 }, content: { padding: 18, gap: 10 }, title: { fontSize: 23, lineHeight: 27 }, excerpt: { fontSize: 14, lineHeight: 21 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2 }, metaText: { fontSize: 12 }, empty: { borderRadius: 28, padding: 40, alignItems: 'center', gap: 12 } });

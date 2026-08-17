import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import ContactSheet from '../../components/ContactSheet';
import InfoSheet from '../../components/InfoSheet';
import IconButton from '../../components/IconButton';
import { AppText, DisplayText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { api, unwrapObject } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

function renderContent(content, theme) {
  return String(content || '').split(/\n{2,}/).map((block, index) => {
    const text = block.trim();
    if (!text) return null;
    if (text.startsWith('### ')) return <DisplayText key={index} style={[styles.h3, { color: theme.onSurface }]}>{text.slice(4)}</DisplayText>;
    if (text.startsWith('## ')) return <DisplayText key={index} style={[styles.h2, { color: theme.onSurface }]}>{text.slice(3)}</DisplayText>;
    if (text.startsWith('# ')) return <DisplayText key={index} style={[styles.h1, { color: theme.onSurface }]}>{text.slice(2)}</DisplayText>;
    if (text.startsWith('> ')) return <AppText key={index} muted style={[styles.quote, { borderLeftColor: theme.primary }]}>{text.slice(2)}</AppText>;
    return <AppText key={index} style={[styles.paragraph, { color: theme.onSurface }]}>{text.replace(/\*\*/g, '').replace(/`/g, '')}</AppText>;
  });
}
export default function BlogPost() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { t, locale } = useLanguage();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(false);
  const [info, setInfo] = useState(false);
  useEffect(() => { api.get(`/blog/posts/${slug}`).then(r => setPost(unwrapObject(r, 'post'))).catch(() => setPost(null)).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <Screen><LoadingView /></Screen>;
  if (!post) return <Screen><View style={styles.error}><DisplayText style={styles.errorTitle}>404</DisplayText><AppText muted>{t.postNotFound}</AppText><Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: theme.primary }]}><AppText style={{ color: theme.onPrimary }}>{t.back}</AppText></Pressable></View></Screen>;
  const minutes = Math.max(1, Math.ceil(String(post.content || '').split(/\s+/).length / 200));
  return <Screen><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.topbar}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={22} color={theme.primary} /><AppText style={{ color: theme.primary }}>{t.backBlog}</AppText></Pressable><View style={styles.topActions}><IconButton icon="mail" onPress={() => setContact(true)} accessibilityLabel={t.contact} /><IconButton icon="info" onPress={() => setInfo(true)} accessibilityLabel={t.info} /></View></View>
    <View style={[styles.article, { backgroundColor: theme.card, borderColor: theme.surfaceVariant, borderWidth: 1 }]}><DisplayText style={styles.title}>{post.title}</DisplayText><View style={styles.meta}><AppText style={{ color: theme.onSurfaceVariant }}>{new Date(post.published_at || post.created_at).toLocaleDateString(locale)}</AppText><AppText style={{ color: theme.onSurfaceVariant }}>{minutes} {t.readMinutes}</AppText>{post.views ? <AppText style={{ color: theme.onSurfaceVariant }}>{post.views} {t.views}</AppText> : null}</View>{post.cover_image ? <Image source={{ uri: post.cover_image }} style={styles.cover} /> : null}<View>{renderContent(post.content, theme)}</View><Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: theme.primary }]}><AppText style={{ color: theme.onPrimary }}>{t.backToBlog}</AppText></Pressable></View>
  </ScrollView><ContactSheet visible={contact} onClose={() => setContact(false)} /><InfoSheet visible={info} onClose={() => setInfo(false)} /></Screen>;
}
const styles = StyleSheet.create({ topbar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},topActions:{flexDirection:'row',gap:6}, container: { padding: 18, paddingBottom: 100, gap: 16 }, back: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44 }, article: { borderRadius: 30, padding: 22 }, title: { fontSize: 34, lineHeight: 39 }, meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 22 }, cover: { width: '100%', height: 210, borderRadius: 20, marginBottom: 24 }, h1: { fontSize: 30, marginTop: 18, marginBottom: 12 }, h2: { fontSize: 25, marginTop: 18, marginBottom: 10 }, h3: { fontSize: 21, marginTop: 16, marginBottom: 8 }, paragraph: { fontSize: 16, lineHeight: 28, marginBottom: 18 }, quote: { fontSize: 16, lineHeight: 25, borderLeftWidth: 3, paddingLeft: 14, marginVertical: 12 }, button: { minHeight: 50, borderRadius: 25, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10 }, error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, errorTitle: { fontSize: 90 } });

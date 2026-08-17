import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { AppText, DisplayText } from '../../components/AppText';
import LoadingView from '../../components/LoadingView';
import BackButton from '../../components/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Dashboard() {
  const { theme } = useTheme(); const { t, locale } = useLanguage(); const { api, admin } = useAuth(); const router = useRouter();
  const [stats, setStats] = useState({ posts: 0, views: 0, published: 0 }); const [recentPosts, setRecentPosts] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let mounted=true; Promise.all([api.get('/blog/stats'), api.get('/blog/posts?limit=5&publishedOnly=false')]).then(([statsRes, postsRes]) => { if (!mounted) return; setStats(statsRes.data || {}); setRecentPosts(postsRes.data?.posts || postsRes.data?.data || (Array.isArray(postsRes.data) ? postsRes.data : [])); }).catch(() => {}).finally(() => mounted && setLoading(false)); return () => { mounted=false; }; }, []);
  if (loading) return <Screen><LoadingView /></Screen>;
  return <Screen><ScrollView contentContainerStyle={styles.container}>
    <BackButton fallback="/(tabs)/settings" />
    <SectionHeader eyebrow={t.adminLabel} title={t.adminDashboard} description={`${t.hello}, ${admin?.username || 'Admin'}.`} />
    <View style={styles.grid}>{[["article",t.posts,stats.published ?? 0],["visibility",t.postViews,stats.views ?? 0],["library-books",t.allPostsTitle,stats.posts ?? 0]].map(([icon,label,value]) => <View key={label} style={[styles.stat,{backgroundColor:theme.card,borderColor:theme.surfaceVariant}]}><MaterialIcons name={icon} size={26} color={theme.primary}/><AppText muted>{label}</AppText><DisplayText style={styles.value}>{String(value)}</DisplayText></View>)}</View>
    <View style={[styles.card,{backgroundColor:theme.card,borderColor:theme.surfaceVariant}]}><DisplayText style={styles.cardTitle}>{t.management}</DisplayText><Pressable onPress={()=>router.push('/admin/posts')} style={[styles.action,{backgroundColor:theme.primary}]}><MaterialIcons name="article" size={20} color={theme.onPrimary}/><AppText style={{color:theme.onPrimary}}>{t.allPosts}</AppText></Pressable><Pressable onPress={()=>router.push('/admin/posts/new')} style={[styles.action,{backgroundColor:theme.surfaceVariant}]}><MaterialIcons name="add" size={20} color={theme.onSurface}/><AppText style={{color:theme.onSurface}}>{t.newPost}</AppText></Pressable></View>
    <View style={[styles.card,{backgroundColor:theme.card,borderColor:theme.surfaceVariant}]}><DisplayText style={styles.cardTitle}>{t.recentPosts}</DisplayText>{recentPosts.length ? recentPosts.map(post=><View key={post.id} style={[styles.recent,{borderColor:theme.surfaceVariant}]}><View style={{flex:1}}><AppText style={{fontWeight:'700'}} numberOfLines={1}>{post.title}</AppText><AppText muted style={styles.date}>{new Date(post.created_at).toLocaleDateString(locale)}</AppText></View><AppText style={{color:post.published?theme.primary:theme.onSurfaceVariant,fontSize:11}}>{post.published?t.published:t.draft}</AppText></View>) : <AppText muted>{t.noPosts}</AppText>}</View>
  </ScrollView></Screen>;
}
const styles=StyleSheet.create({container:{padding:18,paddingBottom:100,gap:16},grid:{flexDirection:'row',gap:8},stat:{flex:1,minHeight:145,borderRadius:24,borderWidth:1,padding:15,gap:8},value:{fontSize:30},card:{borderRadius:28,borderWidth:1,padding:20,gap:12},cardTitle:{fontSize:24,marginBottom:4},action:{minHeight:52,borderRadius:26,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},recent:{borderBottomWidth:1,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:12},date:{fontSize:11,marginTop:3}});

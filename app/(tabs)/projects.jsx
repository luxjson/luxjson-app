import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import SectionHeader from '../../components/SectionHeader';
import LoadingView from '../../components/LoadingView';
import ProjectCard from '../../components/ProjectCard';
import ProjectDetailsSheet from '../../components/ProjectDetailsSheet';
import { AppText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchGithubProfile, getGithubConnection } from '../../lib/github';
import { openExternal } from '../../lib/external';

export default function Projects() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [repos, setRepos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const username = await getGithubConnection();
      const result = await fetchGithubProfile(username);
      setProfile(result.profile);
      setRepos(Array.isArray(result.repos) ? result.repos.filter(r => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)) : []);
    } catch {
      setRepos([]);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return <Screen><FlatList
    data={repos}
    keyExtractor={item => String(item.id)}
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    ListHeaderComponent={<><AppHeader title={t.projects} />
      <SectionHeader eyebrow="GITHUB" title={t.projects} description={t.projectsDesc} />
      {profile ? <View style={[styles.stats, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}><Stat label={t.repositories} value={profile.public_repos} theme={theme} /><Stat label={t.followers} value={profile.followers} theme={theme} /><Stat label="Following" value={profile.following} theme={theme} /></View> : null}
    </>}
    ListEmptyComponent={loading ? <View style={{ height: 220 }}><LoadingView label={t.loadingProjects} /></View> : <View style={styles.empty}><MaterialIcons name="code-off" size={42} color={theme.onSurfaceVariant} /><AppText muted>{t.noProjects}</AppText></View>}
    renderItem={({ item }) => <ProjectCard repo={item} onPress={() => setSelected(item)} />}
  /><ProjectDetailsSheet visible={!!selected} project={selected} onClose={() => setSelected(null)} onInsomnia={() => { setSelected(null); router.push('/insomnia'); }} /></Screen>;
}
function Stat({ label, value, theme }) { return <View style={styles.stat}><AppText muted style={styles.statLabel}>{label}</AppText><AppText style={{ color: theme.onSurface, fontFamily: 'LuxFirsNeue', fontSize: 19 }}>{String(value ?? 0)}</AppText></View>; }
const styles = StyleSheet.create({ container:{padding:18,paddingBottom:130},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},profileButton:{minHeight:38,paddingHorizontal:13,borderRadius:20,flexDirection:'row',alignItems:'center',gap:5},stats:{borderWidth:1,borderRadius:24,padding:14,flexDirection:'row',marginBottom:16},stat:{flex:1,gap:3},statLabel:{fontSize:11},empty:{alignItems:'center',gap:12,padding:45}});

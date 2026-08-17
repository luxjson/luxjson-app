import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import { AppText, DisplayText } from '../../components/AppText';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import ProjectCard from '../../components/ProjectCard';
import ContactSheet from '../../components/ContactSheet';
import ProjectDetailsSheet from '../../components/ProjectDetailsSheet';
import InfoSheet from '../../components/InfoSheet';
import IconButton from '../../components/IconButton';
import BrandIconButton from '../../components/BrandIconButton';
import LoadingView from '../../components/LoadingView';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { unwrapList } from '../../lib/api';
import { GITHUB_USER } from '../../constants/config';
import { openExternal } from '../../lib/external';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(false);
  const [info, setInfo] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [githubUser, setGithubUser] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
    ]).then(async ([userResponse, reposResponse]) => {
      const user = await userResponse.json();
      const repos = await reposResponse.json();
      setGithubUser(user);
      const targets = ['analisai-express', 'react', 'light', 'insomnia', 'SENAI-MaryCario'];
      const blacklist = ['lightoldwebsite'];
      setProjects(Array.isArray(repos) ? repos.filter(repo => targets.some(x => repo.name.toLowerCase().includes(x)) && !blacklist.includes(repo.name.toLowerCase())) : []);
    }).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);
  return <Screen><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
    <View style={styles.topbar}><Pressable onPress={() => router.push('/')}><DisplayText style={styles.logo}>luxjson</DisplayText></Pressable><View style={styles.topActions}><IconButton icon="mail" onPress={() => setContact(true)} accessibilityLabel={t.contact} /><Pressable onPress={() => router.push('/(tabs)/settings')} style={[styles.lang, { backgroundColor: theme.onSurface }]}><MaterialIcons name="language" size={19} color={theme.surface} /></Pressable></View></View>
    <View style={[styles.hero, { backgroundColor: theme.primaryContainer }]}><AppText style={[styles.heroEyebrow, { color: theme.primary }]}>{t.work}</AppText><DisplayText style={styles.heroTitle}>{t.hero}</DisplayText><AppText muted style={styles.heroDesc}>{t.desc}</AppText><Pressable onPress={() => setContact(true)} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary }, pressed && { opacity: .85 }]}><AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{t.contact}</AppText><MaterialIcons name="arrow-forward" size={20} color={theme.onPrimary} /></Pressable></View>
    <SectionHeader eyebrow={t.work} title={t.about} description={t.aboutDesc} />
    {loading ? <View style={{ height: 180 }}><LoadingView label={t.loadingProjects} /></View> : projects.length ? projects.map(repo => <ProjectCard key={repo.id} repo={repo} onPress={() => setSelectedProject(repo)} />) : <AppText muted>{t.noProjects}</AppText>}
    <View style={[styles.deadCard, { backgroundColor: theme.onSurface }]}><View style={styles.deadTop}><Image source={require('../../assets/icon/luxjson-icon.png')} style={styles.deadIcon} /><MaterialIcons name="sports-esports" size={32} color={theme.surface} /></View><DisplayText style={[styles.deadTitle, { color: theme.surface }]}>{t.dead}</DisplayText><AppText style={[styles.deadSlogan, { color: theme.surfaceVariant }]}>{t.deadSlogan}</AppText><AppText style={[styles.deadDesc, { color: theme.surfaceVariant }]}>{t.deadDesc}</AppText><Pressable onPress={() => openExternal('https://github.com/teamdeadsmile')} style={[styles.outlineButton, { borderColor: theme.surfaceVariant }]}><AppText style={{ color: theme.surface }}>{t.org}</AppText><MaterialIcons name="open-in-new" size={18} color={theme.surface} /></Pressable></View>
    <View style={[styles.aboutCard, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <AppText style={[styles.aboutEyebrow, { color: theme.primary }]}>{t.aboutLabel}</AppText>
      <DisplayText style={styles.aboutTitle}>{t.about}</DisplayText>
      <AppText muted style={styles.aboutDesc}>{t.aboutDesc}</AppText>
      <View style={styles.aboutProfile}>
        <View style={[styles.aboutAvatar, { backgroundColor: theme.primaryContainer }]}>
          <MaterialIcons name="code" size={25} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={styles.aboutName}>luxjson</AppText>
          <AppText muted style={styles.aboutBio}>{t.aboutBio}</AppText>
        </View>
      </View>
    </View>
    <View style={styles.footer}>
      <DisplayText style={styles.footerLogo}>luxjson</DisplayText>
      <AppText muted style={{ textAlign: 'center' }}>{t.slogan}</AppText>
      {githubUser ? <AppText muted style={styles.githubStats}>GitHub · {githubUser.public_repos || 0} {t.repositories} · {githubUser.followers || 0} {t.followers}</AppText> : null}
      <View style={styles.socials}>
        <BrandIconButton icon="github" onPress={() => openExternal('https://github.com/luxjson')} accessibilityLabel="GitHub" />
        <BrandIconButton icon="instagram" onPress={() => openExternal('https://instagram.com/luxjson')} accessibilityLabel="Instagram" />
        <BrandIconButton icon="linkedin" onPress={() => openExternal('https://linkedin.com/in/luxjson')} accessibilityLabel="LinkedIn" />
        <IconButton icon="info" onPress={() => setInfo(true)} accessibilityLabel={t.info} />
      </View>
    </View>
  </ScrollView>
  <ContactSheet visible={contact} onClose={() => setContact(false)} />
  <ProjectDetailsSheet visible={!!selectedProject} project={selectedProject} onClose={() => setSelectedProject(null)} onInsomnia={() => { setSelectedProject(null); router.push('/insomnia'); }} />
  <InfoSheet visible={info} onClose={() => setInfo(false)} />
</Screen>;
}
const styles = StyleSheet.create({ container: { padding: 18, paddingBottom: 100, gap: 22 }, topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }, logo: { fontSize: 25 }, topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, lang: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, hero: { borderRadius: 32, padding: 24, overflow: 'hidden', minHeight: 440, justifyContent: 'flex-end', gap: 14 }, heroIcon: { position: 'absolute', width: 132, height: 132, right: 8, top: 18, opacity: .9, borderRadius: 46 }, heroEyebrow: { fontFamily: 'LuxPoppinsBold', letterSpacing: 2, fontSize: 12 }, heroTitle: { fontSize: 46, lineHeight: 48 }, heroDesc: { fontSize: 15, lineHeight: 22, maxWidth: 330 }, primaryButton: { marginTop: 8, minHeight: 54, borderRadius: 27, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, deadCard: { borderRadius: 32, padding: 24, gap: 12 }, deadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, deadIcon: { width: 50, height: 50, borderRadius: 16 }, deadTitle: { fontSize: 38 }, deadSlogan: { fontSize: 15 }, deadDesc: { fontSize: 14, lineHeight: 21 }, outlineButton: { marginTop: 6, borderWidth: 1, minHeight: 52, borderRadius: 26, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, aboutCard: { borderWidth: 1, borderRadius: 32, padding: 24, gap: 10 }, aboutEyebrow: { fontFamily: 'LuxPoppinsBold', letterSpacing: 2, fontSize: 12 }, aboutTitle: { fontSize: 34, lineHeight: 38, marginTop: 3 }, aboutDesc: { fontSize: 15, lineHeight: 22 }, aboutProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }, aboutAvatar: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, aboutName: { fontFamily: 'LuxPoppinsBold' }, aboutBio: { fontSize: 12, lineHeight: 18, marginTop: 2 }, footer: { alignItems: 'center', gap: 8, paddingVertical: 24 }, githubStats: { fontFamily: 'monospace', fontSize: 11, marginTop: 4 }, footerLogo: { fontSize: 34 }, socials: { flexDirection: 'row', gap: 10, marginTop: 8 } });

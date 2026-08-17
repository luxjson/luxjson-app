import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';

export default function ProjectCard({ repo, onPress }) {
  const { theme } = useTheme();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }, pressed && { transform: [{ translateY: 2 }] }]}>
    <View style={[styles.imageWrap, { backgroundColor: theme.surfaceVariant }]}>
      <Image source={{ uri: `https://opengraph.githubassets.com/1/${repo.full_name}` }} style={styles.image} />
    </View>
    <View style={styles.content}>
      <View style={styles.titleRow}><DisplayText numberOfLines={1} style={styles.title}>{repo.name}</DisplayText><MaterialIcons name="arrow-outward" size={20} color={theme.primary} /></View>
      <AppText muted numberOfLines={3} style={styles.desc}>{repo.description || 'Projeto sem descrição disponível.'}</AppText>
      <View style={styles.meta}><AppText muted style={styles.metaText}>{repo.language || 'Code'}</AppText><AppText muted style={styles.metaText}>★ {repo.stargazers_count || 0}</AppText><AppText muted style={styles.metaText}>⑂ {repo.forks_count || 0}</AppText></View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({ card: { borderRadius: 28, borderWidth: 1, overflow: 'hidden', marginBottom: 14 }, imageWrap: { height: 150 }, image: { width: '100%', height: '100%' }, content: { padding: 18, gap: 10 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, title: { fontSize: 21, flex: 1 }, desc: { fontSize: 14, lineHeight: 20 }, meta: { flexDirection: 'row', gap: 14, marginTop: 4 }, metaText: { fontSize: 12 } });

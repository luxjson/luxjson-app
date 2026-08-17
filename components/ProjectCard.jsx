import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';

export default function ProjectCard({ repo, onPress }) {
  const { theme } = useTheme();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }, pressed && { transform: [{ translateY: 2 }], opacity: .92 }]}>
    <View style={[styles.banner, { backgroundColor: theme.primaryContainer }]}>
      {repo.owner?.avatar_url ? <Image source={{ uri: repo.owner.avatar_url }} style={styles.avatar} /> : <MaterialIcons name="code" size={42} color={theme.primary} />}
      <View style={styles.bannerText}><AppText style={[styles.bannerEyebrow, { color: theme.primary }]}>{repo.language || 'CODE'}</AppText><DisplayText numberOfLines={1} style={styles.bannerTitle}>{repo.name}</DisplayText></View>
      <MaterialIcons name="open-in-new" size={22} color={theme.primary} />
    </View>
    <View style={styles.content}><AppText muted numberOfLines={3} style={styles.desc}>{repo.description || 'Projeto sem descrição disponível.'}</AppText><View style={styles.meta}><AppText muted style={styles.metaText}>★ {repo.stargazers_count || 0}</AppText><AppText muted style={styles.metaText}>⑂ {repo.forks_count || 0}</AppText><AppText muted style={styles.metaText}>● {repo.open_issues_count || 0}</AppText></View></View>
  </Pressable>;
}
const styles=StyleSheet.create({card:{borderRadius:28,borderWidth:1,overflow:'hidden',marginBottom:14},banner:{height:132,padding:18,flexDirection:'row',alignItems:'center',gap:12},avatar:{width:58,height:58,borderRadius:18},bannerText:{flex:1,gap:3},bannerEyebrow:{fontFamily:'LuxFirsNeue',fontSize:10,letterSpacing:1.5},bannerTitle:{fontSize:22,textTransform:'capitalize'},content:{padding:17,gap:10},desc:{fontSize:14,lineHeight:20},meta:{flexDirection:'row',gap:15},metaText:{fontSize:11}});

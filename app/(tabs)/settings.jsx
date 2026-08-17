import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { AppText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { openExternal } from '../../lib/external';

export default function Settings() {
  const { theme, mode, setThemeMode, materialYou, setMaterialYouEnabled } = useTheme();
  const { isAuthenticated, logout, admin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const languages = [['pt', t.portuguese], ['en', t.english], ['es', t.spanish]];
  return <Screen><ScrollView contentContainerStyle={styles.container}>
    <SectionHeader eyebrow="luxjson" title={t.settingsTitle} description={t.settingsDesc} />
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <View style={styles.row}><View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}><MaterialIcons name="palette" size={23} color={theme.primary} /></View><View style={styles.flex}><AppText style={styles.title}>{t.materialYou}</AppText><AppText muted style={styles.desc}>{t.materialDesc}</AppText></View><Switch value={materialYou} onValueChange={setMaterialYouEnabled} trackColor={{ false: theme.surfaceVariant, true: theme.primaryContainer }} thumbColor={materialYou ? theme.primary : theme.onSurfaceVariant} /></View>
      <View style={[styles.divider, { backgroundColor: theme.surfaceVariant }]} />
      <AppText style={styles.title}>{t.theme}</AppText>
      <View style={styles.themeRow}>{[['system',t.system],['light',t.light],['dark',t.dark]].map(([value,label]) => <Pressable key={value} onPress={() => setThemeMode(value)} style={[styles.themeButton, { borderColor: mode === value ? theme.primary : theme.surfaceVariant, backgroundColor: mode === value ? theme.primaryContainer : theme.surface }]}><AppText style={{ color: mode === value ? theme.primary : theme.onSurface }}>{label}</AppText></Pressable>)}</View>
    </View>
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <View style={styles.row}><View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}><MaterialIcons name="language" size={23} color={theme.primary} /></View><View style={styles.flex}><AppText style={styles.title}>{t.language}</AppText><AppText muted style={styles.desc}>{t.portuguese} / {t.english} / {t.spanish}</AppText></View></View>
      <View style={styles.themeRow}>{languages.map(([value,label]) => <Pressable key={value} onPress={() => setLanguage(value)} style={[styles.themeButton, { borderColor: language === value ? theme.primary : theme.surfaceVariant, backgroundColor: language === value ? theme.primaryContainer : theme.surface }]}><AppText style={{ color: language === value ? theme.primary : theme.onSurface }}>{label}</AppText></Pressable>)}</View>
    </View>
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <AppText style={styles.title}>{t.externalLinks}</AppText>
      {[["code","GitHub","https://github.com/luxjson"],["language",t.docs,"https://api.luxjson.is-a.dev/docs"]].map(([icon,label,url]) => <Pressable key={url} onPress={() => openExternal(url)} style={styles.link}><MaterialIcons name={icon} size={22} color={theme.primary} /><AppText style={styles.flex}>{label}</AppText><MaterialIcons name="open-in-new" size={20} color={theme.onSurfaceVariant} /></Pressable>)}
    </View>
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <AppText style={styles.title}>{t.adminArea}</AppText>
      <AppText muted style={styles.desc}>{isAuthenticated ? `${t.session}: ${admin?.username || 'Admin'}` : t.manageBlog}</AppText>
      <Pressable onPress={isAuthenticated ? () => router.push('/admin') : () => router.push('/login')} style={[styles.action, { backgroundColor: theme.primary }]}><AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{isAuthenticated ? t.openPanel : t.login}</AppText></Pressable>
      {isAuthenticated ? <Pressable onPress={async () => { await logout(); router.replace('/'); }} style={[styles.action, { backgroundColor: theme.surfaceVariant }]}><AppText style={{ color: theme.onSurface, fontWeight: '700' }}>{t.logout}</AppText></Pressable> : null}
    </View>
    <AppText muted style={styles.version}>Version 1.0.0</AppText>
  </ScrollView></Screen>;
}
const styles = StyleSheet.create({ container:{padding:18,paddingBottom:100,gap:16},card:{borderWidth:1,borderRadius:28,padding:20,gap:16},row:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center'},flex:{flex:1},title:{fontSize:17,fontFamily:'LuxPoppinsBold'},desc:{fontSize:13,lineHeight:19,marginTop:3},divider:{height:1},themeRow:{flexDirection:'row',gap:8},themeButton:{flex:1,minHeight:46,borderWidth:1,borderRadius:23,alignItems:'center',justifyContent:'center',paddingHorizontal:8},link:{flexDirection:'row',alignItems:'center',gap:12,minHeight:46},action:{minHeight:50,borderRadius:25,alignItems:'center',justifyContent:'center'},version:{textAlign:'center',paddingVertical:10}});

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import Screen from '../components/Screen';
import { AppText, DisplayText } from '../components/AppText';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { openExternal } from '../lib/external';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../constants/config';

export default function Insomnia() {
  const { theme } = useTheme(); const { t } = useLanguage(); const router=useRouter(); const [status,setStatus]=useState('idle'); const [latency,setLatency]=useState(null);
  const health=async()=>{setStatus('loading');const start=Date.now();try{const r=await fetch(`${API_URL}/health`);setLatency(Date.now()-start);setStatus(r.ok?'online':'error');}catch{setStatus('error');setLatency(null);}};
  useEffect(()=>{health();},[]);
  return <Screen><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <AppHeader title={t.insomnia} />
    <BackButton fallback="/(tabs)/projects"/>
    <View style={[styles.hero,{backgroundColor:theme.onSurface}]}><View style={[styles.logo,{backgroundColor:theme.primary}]}><MaterialIcons name="terminal" size={31} color={theme.onPrimary}/></View><AppText style={[styles.eyebrow,{color:theme.primaryContainer}]}>{t.project}</AppText><DisplayText style={[styles.title,{color:theme.surface}]}>{t.insomnia}</DisplayText><AppText style={{color:theme.surfaceVariant,lineHeight:22}}>{t.insomniaSlogan}</AppText></View>
    <View style={[styles.status,{backgroundColor:theme.card,borderColor:theme.surfaceVariant}]}><View style={[styles.dot,{backgroundColor:status==='online'?theme.success:status==='error'?theme.error:theme.warning}]}/><View style={{flex:1}}><AppText style={styles.statusTitle}>{status==='online'?'API ONLINE':status==='error'?'API UNAVAILABLE':'CHECKING API'}</AppText><AppText muted style={styles.statusDesc}>{latency!==null?`${API_URL} · ${latency}ms`:API_URL}</AppText></View><Pressable onPress={health}><MaterialIcons name="refresh" size={22} color={theme.primary}/></Pressable></View>
    <View style={[styles.card,{backgroundColor:theme.card,borderColor:theme.surfaceVariant}]}><AppText style={styles.heading}>API WORKSPACE</AppText><Endpoint method="GET" path="/api/health" theme={theme}/><Endpoint method="GET" path="/api/blog/posts" theme={theme}/><Endpoint method="POST" path="/api/auth/login" theme={theme}/><AppText muted style={styles.note}>{t.insomniaDesc}</AppText><Pressable onPress={()=>openExternal(`${API_URL.replace(/\/api\/?$/, "")}/docs`)} style={[styles.button,{backgroundColor:theme.primary}]}><AppText style={{color:theme.onPrimary,fontWeight:'700'}}>{t.docs}</AppText><MaterialIcons name="open-in-new" size={19} color={theme.onPrimary}/></Pressable></View>
    <View style={[styles.card,{backgroundColor:theme.primaryContainer}]}><View style={styles.row}><MaterialIcons name="science" size={24} color={theme.primary}/><View style={{flex:1}}><AppText style={styles.heading}>INSOMNIA PROJECT</AppText><AppText muted style={{lineHeight:19}}>{t.insomniaSlogan}</AppText></View></View><Pressable onPress={()=>openExternal('https://somiari.itch.io/insomnia')} style={[styles.outline,{borderColor:theme.primary}]}><AppText style={{color:theme.primary,fontWeight:'700'}}>{t.openInsomnia}</AppText><MaterialIcons name="open-in-new" size={18} color={theme.primary}/></Pressable></View>
  </ScrollView></Screen>;
}
function Endpoint({method,path,theme}){return <View style={[styles.endpoint,{borderColor:theme.surfaceVariant}]}><AppText style={[styles.method,{color:method==='POST'?theme.tertiary:theme.primary}]}>{method}</AppText><AppText style={{flex:1}}>{path}</AppText><MaterialIcons name="chevron-right" size={19} color={theme.onSurfaceVariant}/></View>}
const styles=StyleSheet.create({container:{padding:18,paddingBottom:120,gap:15},hero:{borderRadius:30,padding:22,minHeight:300,justifyContent:'flex-end',gap:10},logo:{width:62,height:62,borderRadius:20,alignItems:'center',justifyContent:'center',marginBottom:'auto'},eyebrow:{fontFamily:'LuxFirsNeue',fontSize:11,letterSpacing:2},title:{fontSize:46},status:{borderWidth:1,borderRadius:24,padding:16,flexDirection:'row',alignItems:'center',gap:12},dot:{width:10,height:10,borderRadius:5},statusTitle:{fontFamily:'LuxFirsNeue',fontSize:13},statusDesc:{fontSize:11,marginTop:2},card:{borderWidth:1,borderRadius:28,padding:20,gap:14},heading:{fontFamily:'LuxFirsNeue',letterSpacing:1.5,fontSize:12},endpoint:{minHeight:48,borderWidth:1,borderRadius:18,paddingHorizontal:13,flexDirection:'row',alignItems:'center',gap:11},method:{fontFamily:'monospace',fontSize:11,fontWeight:'700',width:42},note:{fontSize:13,lineHeight:20},button:{minHeight:50,borderRadius:25,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},row:{flexDirection:'row',alignItems:'center',gap:10},outline:{minHeight:48,borderWidth:1,borderRadius:24,paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}});

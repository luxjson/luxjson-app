import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
export default function LoadingView({ label }) { const { theme } = useTheme(); const { t } = useLanguage(); return <View style={styles.wrap}><ActivityIndicator color={theme.primary} size="large" /><AppText muted>{label || t.loading}</AppText></View>; }
const styles=StyleSheet.create({wrap:{flex:1,alignItems:'center',justifyContent:'center',gap:14}});

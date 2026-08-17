import { StyleSheet, View } from 'react-native';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';

export default function SectionHeader({ eyebrow, title, description }) {
  const { theme } = useTheme();
  return <View style={styles.wrap}>
    {eyebrow ? <AppText muted style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</AppText> : null}
    <DisplayText style={styles.title}>{title}</DisplayText>
    {description ? <AppText muted style={styles.description}>{description}</AppText> : null}
  </View>;
}
const styles = StyleSheet.create({ wrap: { gap: 8, marginBottom: 24 }, eyebrow: { fontSize: 12, letterSpacing: 2, fontWeight: '700' }, title: { fontSize: 38, lineHeight: 42 }, description: { fontSize: 15, lineHeight: 22 } });

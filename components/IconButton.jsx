import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useTheme } from '../context/ThemeContext';

export default function IconButton({ icon, onPress, size = 46, accessibilityLabel }) {
  const { theme } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.onSurface }, pressed && { transform: [{ scale: 0.94 }] }]}>
    <MaterialIcons name={icon} size={22} color={theme.surface} />
  </Pressable>;
}
const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });

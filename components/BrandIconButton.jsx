import { Pressable, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BrandIconButton({ icon, onPress, size = 46, accessibilityLabel }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.onSurface },
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      <FontAwesome5 name={icon} brand size={20} color={theme.surface} />
    </Pressable>
  );
}
const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });

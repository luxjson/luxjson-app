import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function BackButton({ label, fallback = '/' }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel={label || t.back}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surfaceVariant },
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
      <AppText style={{ color: theme.onSurface, fontWeight: '700' }}>
        {label || t.back}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});

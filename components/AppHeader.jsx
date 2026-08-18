import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import { AppText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ContactSheet from './ContactSheet';
import InfoSheet from './InfoSheet';

export default function AppHeader({ title = 'luxjson', showActions = true }) {
  const { theme, colorScheme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [contact, setContact] = React.useState(false);
  const [info, setInfo] = React.useState(false);

  const actionBackground = colorScheme === 'dark' ? theme.onSurface : theme.surfaceVariant;
  const actionForeground = colorScheme === 'dark' ? theme.surface : theme.onSurface;

  return (
    <>
      <View style={styles.container}>
        <AppText style={styles.title}>{title}</AppText>
        {showActions ? (
          <View style={styles.actions}>
            <Pressable
              onPress={() => setContact(true)}
              accessibilityRole="button"
              accessibilityLabel={t.contact}
              style={({ pressed }) => [styles.action, { backgroundColor: actionBackground }, pressed && styles.pressed]}
            >
              <MaterialIcons name="mail-outline" size={20} color={actionForeground} />
            </Pressable>
            <Pressable
              onPress={() => setInfo(true)}
              accessibilityRole="button"
              accessibilityLabel={t.info}
              style={({ pressed }) => [styles.action, { backgroundColor: actionBackground }, pressed && styles.pressed]}
            >
              <MaterialIcons name="info-outline" size={20} color={actionForeground} />
            </Pressable>
          </View>
        ) : null}
      </View>
      <ContactSheet visible={contact} onClose={() => setContact(false)} />
      <InfoSheet visible={info} onClose={() => setInfo(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  action: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});

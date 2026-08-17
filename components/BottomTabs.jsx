import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomTabs() {
  const { theme, navStyle } = useTheme();
  const { t, language } = useLanguage();
  const floating = navStyle === 'floating';
  return (
    <Tabs key={`tabs-${language}`} screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.onSurfaceVariant,
      tabBarStyle: floating
        ? { position: 'absolute', left: 14, right: 14, bottom: 12, height: 68, paddingTop: 7, paddingBottom: 9, borderRadius: 34, backgroundColor: theme.surface, borderTopWidth: 0, borderWidth: 1, borderColor: theme.surfaceVariant, ...Platform.select({ web: { boxShadow: '0 6px 22px rgba(0,0,0,0.12)' }, default: { elevation: 8, shadowOpacity: 0.12 } }) }
        : { backgroundColor: theme.surface, borderTopColor: theme.surfaceVariant, height: 72, paddingTop: 8, paddingBottom: 10 },
      tabBarLabelStyle: { fontFamily: 'LuxFirsNeue', fontSize: 10 },
    }}>
      <Tabs.Screen name="index" options={{ title: t.home, tabBarLabel: t.home, tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="projects" options={{ title: t.projects, tabBarLabel: t.projects, tabBarIcon: ({ color, size }) => <MaterialIcons name="code" size={size} color={color} /> }} />
      <Tabs.Screen name="games" options={{ title: t.games, tabBarLabel: t.games, tabBarIcon: ({ color, size }) => <MaterialIcons name="sports-esports" size={size} color={color} /> }} />
      <Tabs.Screen name="blog" options={{ title: t.blog, tabBarLabel: t.blog, tabBarIcon: ({ color, size }) => <MaterialIcons name="article" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: t.settings, tabBarLabel: t.settings, tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}

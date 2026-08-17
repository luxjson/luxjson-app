import { Tabs } from 'expo-router';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomTabs() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  return (
    <Tabs
      key={`tabs-${language}`}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.surfaceVariant, height: 72, paddingTop: 8, paddingBottom: 10 },
        tabBarLabelStyle: { fontFamily: 'LuxPoppins', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.home, tabBarLabel: t.home, tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="blog" options={{ title: t.blog, tabBarLabel: t.blog, tabBarIcon: ({ color, size }) => <MaterialIcons name="article" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: t.settings, tabBarLabel: t.settings, tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}

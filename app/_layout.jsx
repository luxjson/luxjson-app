import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();
function RootNavigator() {
  const { colorScheme } = useTheme();
  return <View style={{ flex: 1 }}><StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 220 }} /></View>;
}
export default function RootLayout() {
  const [loaded] = useFonts({ LuxAsgard: require('../assets/fonts/BOLD.ttf'), LuxPoppins: require('../assets/fonts/Poppins-Medium.ttf'), LuxPoppinsBold: require('../assets/fonts/Poppins-Bold.ttf') });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return <ThemeProvider><LanguageProvider><AuthProvider><RootNavigator /></AuthProvider></LanguageProvider></ThemeProvider>;
}

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import UpdateChecker from '../components/UpdateChecker';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { colorScheme, animations } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: animations ? 'slide_from_right' : 'none',
          animationDuration: animations ? 220 : 0,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    LuxFirsNeue: require('../assets/fonts/BOLD.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RootNavigator />
          <UpdateChecker />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
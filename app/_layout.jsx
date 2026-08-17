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
  const { colorScheme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    LuxAsgard: require('../assets/fonts/BOLD.ttf'),
    LuxPoppins: require('../assets/fonts/Poppins-Medium.ttf'),
    LuxPoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
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
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { luxDark, luxLight } from '../constants/theme';
import { getItem, setItem } from '../lib/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() || 'light';
  const [mode, setMode] = useState('system');
  const [materialYou, setMaterialYou] = useState(true);
  const { theme: dynamicTheme } = useMaterial3Theme({ fallbackSourceColor: '#1434CB' });

  useEffect(() => {
    (async () => {
      const [savedMode, savedMaterial] = await Promise.all([
        getItem('lux-theme-mode'), getItem('lux-material-you')
      ]);
      if (savedMode) setMode(savedMode);
      if (savedMaterial !== null) setMaterialYou(savedMaterial !== 'false');
    })();
  }, []);

  const colorScheme = mode === 'system' ? systemScheme : mode;
  const theme = useMemo(() => {
    const fallback = colorScheme === 'dark' ? luxDark : luxLight;
    if (materialYou && dynamicTheme?.[colorScheme]) return { ...fallback, ...dynamicTheme[colorScheme] };
    return fallback;
  }, [colorScheme, materialYou, dynamicTheme]);

  const setThemeMode = async (value) => { setMode(value); await setItem('lux-theme-mode', value); };
  const setMaterialYouEnabled = async (value) => { setMaterialYou(value); await setItem('lux-material-you', value); };

  return <ThemeContext.Provider value={{ theme, mode, setThemeMode, materialYou, setMaterialYouEnabled, colorScheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

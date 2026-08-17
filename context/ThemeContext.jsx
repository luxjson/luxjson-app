import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { luxDark, luxLight } from '../constants/theme';
import { getItem, setItem } from '../lib/storage';

const ThemeContext = createContext(null);

const accents = {
  blue: '#1434CB',
  violet: '#6750A4',
  cyan: '#006874',
  pink: '#8E4A66',
  green: '#386A20',
  orange: '#8A5000',
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() || 'light';
  const [mode, setMode] = useState('system');
  const [materialYou, setMaterialYou] = useState(true);
  const [accent, setAccent] = useState('blue');
  const [navStyle, setNavStyle] = useState('floating');
  const [density, setDensity] = useState('comfortable');
  const [animations, setAnimations] = useState(true);
  const { theme: dynamicTheme } = useMaterial3Theme({ fallbackSourceColor: accents.blue });

  useEffect(() => {
    (async () => {
      const [savedMode, savedMaterial, savedAccent, savedNav, savedDensity, savedAnimations] = await Promise.all([
        getItem('lux-theme-mode'), getItem('lux-material-you'), getItem('lux-accent'), getItem('lux-nav-style'), getItem('lux-density'), getItem('lux-animations')
      ]);
      if (savedMode) setMode(savedMode);
      if (savedMaterial !== null) setMaterialYou(savedMaterial !== 'false');
      if (savedAccent && accents[savedAccent]) setAccent(savedAccent);
      if (savedNav) setNavStyle(savedNav);
      if (savedDensity) setDensity(savedDensity);
      if (savedAnimations !== null) setAnimations(savedAnimations !== 'false');
    })();
  }, []);

  const colorScheme = mode === 'system' ? systemScheme : mode;
  const theme = useMemo(() => {
    const fallback = colorScheme === 'dark' ? luxDark : luxLight;
    const dynamic = materialYou && dynamicTheme?.[colorScheme] ? { ...fallback, ...dynamicTheme[colorScheme] } : fallback;
    if (accent === 'blue' || materialYou) return dynamic;
    return { ...dynamic, primary: accents[accent], primaryContainer: colorScheme === 'dark' ? `${accents[accent]}55` : `${accents[accent]}18` };
  }, [colorScheme, materialYou, dynamicTheme, accent]);

  const persist = async (key, value) => setItem(key, value);
  const setThemeMode = async value => { setMode(value); await persist('lux-theme-mode', value); };
  const setMaterialYouEnabled = async value => { setMaterialYou(value); await persist('lux-material-you', value); };
  const setAccentColor = async value => { if (!accents[value]) return; setAccent(value); await persist('lux-accent', value); };
  const setNavigationStyle = async value => { setNavStyle(value); await persist('lux-nav-style', value); };
  const setDensityMode = async value => { setDensity(value); await persist('lux-density', value); };
  const setAnimationsEnabled = async value => { setAnimations(value); await persist('lux-animations', value); };

  return <ThemeContext.Provider value={{ theme, mode, setThemeMode, materialYou, setMaterialYouEnabled, accent, accents, setAccentColor, navStyle, setNavigationStyle, density, setDensityMode, animations, setAnimationsEnabled, colorScheme }}>
    {children}
  </ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function AppText({ style, muted = false, ...props }) {
  const { theme } = useTheme();
  return <Text {...props} style={[{ color: muted ? theme.onSurfaceVariant : theme.onSurface, fontFamily: 'LuxFirsNeue' }, style]} />;
}

export function DisplayText({ style, ...props }) {
  const { theme } = useTheme();
  return <Text {...props} style={[{ color: theme.onSurface, fontFamily: 'LuxFirsNeue' }, style]} />;
}

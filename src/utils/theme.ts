import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const COLORS = {
  primary: '#6366f1', // Indigo Neon
  secondary: '#ec4899', // Pink Neon
  accent: '#8b5cf6', // Violet
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassDark: 'rgba(0, 0, 0, 0.05)',
  neonBlue: '#00d2ff',
  neonPurple: '#9d50bb',
};

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    fontSize: 57,
  },
  titleLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 22,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    outline: COLORS.accent,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

export const GRADIENTS = {
  primary: [COLORS.neonBlue, COLORS.primary],
  secondary: [COLORS.secondary, COLORS.danger],
  accent: [COLORS.accent, COLORS.neonPurple],
  wellness: ['#34d399', '#059669'],
};

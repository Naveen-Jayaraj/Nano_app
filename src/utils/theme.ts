import { MD3DarkTheme, configureFonts } from 'react-native-paper';

export const COLORS = {
  primary: '#3b82f6', // Electric blue
  secondary: '#7c3aed', // Violet
  accent: '#06b6d4', // Neon cyan
  background: '#0a0f1e', // Deep navy
  surface: '#1a0a2e', // Dark purple
  text: '#f8fafc',
  muted: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b', // Gold for XP
  danger: '#ef4444',
  glass: 'rgba(26, 10, 46, 0.8)',
  glassDark: 'rgba(0, 0, 0, 0.4)',
  neonBlue: '#3b82f6',
  neonPurple: '#7c3aed',
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
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    elevation: {
        level0: 'transparent',
        level1: '#140c21',
        level2: '#1a0a2e',
        level3: '#200b3b',
        level4: '#270c47',
        level5: '#2d0d54',
    },
    outline: COLORS.accent,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

export const GRADIENTS = {
  primary: [COLORS.surface, COLORS.primary],
  secondary: [COLORS.surface, COLORS.secondary],
  accent: [COLORS.primary, COLORS.accent],
  wellness: ['#0d233a', '#06b6d4'],
  glow: ['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.05)']
};

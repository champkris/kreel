/**
 * K-Reels Color Palette
 * Dark theme with Gold/Amber accents
 */

export const colors = {
  // Backgrounds
  background: '#000000',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  surfaceDark: '#0D0D0D',

  // Primary (Gold/Amber)
  primary: '#D4A84B',
  primaryLight: '#FFB800',
  primaryDark: '#8B6914',
  primaryMuted: '#A68532',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  textDark: '#666666',

  // Semantic
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Live/Status
  live: '#FF3B3B',
  online: '#4CAF50',
  offline: '#666666',

  // Borders
  border: '#333333',
  borderLight: '#444444',
  borderActive: '#D4A84B',

  // Gradients (for LinearGradient)
  gradients: {
    gold: ['#FFB800', '#D4A84B', '#8B6914'],
    goldSubtle: ['#D4A84B', '#A68532'],
    dark: ['#1A1A1A', '#000000'],
    darkOverlay: ['transparent', 'rgba(0,0,0,0.8)'],
  },

  // Subscription badges
  badges: {
    free: '#4CAF50',
    premium: '#FFB800',
    exclusive: '#9C27B0',
    new: '#2196F3',
    hot: '#F44336',
    live: '#FF3B3B',
  },

  // Social
  google: '#DB4437',
  apple: '#FFFFFF',
  facebook: '#1877F2',

  // Transparency
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
} as const;

export type ColorKeys = keyof typeof colors;

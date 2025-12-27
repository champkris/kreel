/**
 * K-Reels Spacing System
 * Based on 4px grid
 */

export const spacing = {
  // Base spacing values
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,

  // Screen padding
  screenPadding: 20,
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Card spacing
  cardPadding: 16,
  cardMargin: 12,
  cardBorderRadius: 12,

  // Input spacing
  inputPadding: 16,
  inputPaddingVertical: 14,
  inputBorderRadius: 12,

  // Button spacing
  buttonPadding: 16,
  buttonPaddingVertical: 14,
  buttonBorderRadius: 25,
  buttonBorderRadiusSmall: 20,

  // Tab spacing
  tabPadding: 12,
  tabGap: 24,

  // List spacing
  listItemPadding: 16,
  listItemGap: 12,

  // Section spacing
  sectionGap: 24,
  sectionMarginBottom: 32,

  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarXLarge: 80,

  // Icon sizes
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconXLarge: 32,

  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Bottom tab bar
  tabBarHeight: 80,
  tabBarPadding: 8,
} as const;

// Helper function to get spacing value
export const getSpacing = (multiplier: number): number => {
  return multiplier * 4;
};

/**
 * K-Reels Theme System
 * Centralized exports for all theme constants
 */

export { colors } from './colors';
export { typography, textStyles } from './typography';
export { spacing, getSpacing } from './spacing';

// Combined theme object for convenience
import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
} as const;

export default theme;

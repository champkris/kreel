import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'filled';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  size = 'medium',
  variant = 'outline',
  style,
  textStyle,
}: ChipProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: typography.fontSize.sm,
          borderRadius: 16,
        };
      case 'large':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: typography.fontSize.base,
          borderRadius: 24,
        };
      default:
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: typography.fontSize.md,
          borderRadius: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    if (selected) {
      return {
        container: {
          backgroundColor: variant === 'filled' ? colors.primary : 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        },
        text: {
          color: variant === 'filled' ? colors.background : colors.primary,
        },
      };
    }

    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: colors.surface,
            borderColor: 'transparent',
            borderWidth: 1,
          },
          text: {
            color: colors.textSecondary,
          },
        };
      case 'outline':
      default:
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.border,
            borderWidth: 1,
          },
          text: {
            color: colors.textSecondary,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        variantStyles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: sizeStyles.fontSize },
          variantStyles.text,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});

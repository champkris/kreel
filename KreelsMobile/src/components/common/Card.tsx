import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  borderRadius = 'medium',
  style,
}: CardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.lg;
      default:
        return spacing.cardPadding;
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'small':
        return spacing.borderRadius.md;
      case 'large':
        return spacing.borderRadius.xl;
      default:
        return spacing.cardBorderRadius;
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'gradient':
        return {};
      default:
        return {
          backgroundColor: colors.surface,
        };
    }
  };

  const cardPadding = getPadding();
  const cardBorderRadius = getBorderRadius();
  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    padding: cardPadding,
    borderRadius: cardBorderRadius,
    ...variantStyles,
  };

  if (variant === 'gradient') {
    const content = (
      <LinearGradient
        colors={[colors.surfaceLight, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientContainer,
          { padding: cardPadding, borderRadius: cardBorderRadius },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  gradientContainer: {
    overflow: 'hidden',
  },
});

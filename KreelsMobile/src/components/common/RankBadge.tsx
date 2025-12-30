import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface RankData {
  id?: string;
  name: string;
  icon: string;
  color: string;
  minLevel?: number;
  maxLevel?: number;
}

interface RankBadgeProps {
  rank: RankData;
  level?: number;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
  showName?: boolean;
  variant?: 'default' | 'compact' | 'full';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function RankBadge({
  rank,
  level,
  size = 'medium',
  showLevel = false,
  showName = false,
  variant = 'default',
  onPress,
  style,
}: RankBadgeProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { minWidth: 28, height: 28, borderRadius: 14 },
          icon: { fontSize: 14 },
          level: { fontSize: typography.fontSize.xs },
          name: { fontSize: typography.fontSize.xs },
        };
      case 'large':
        return {
          container: { minWidth: 56, height: 56, borderRadius: 28 },
          icon: { fontSize: 28 },
          level: { fontSize: typography.fontSize.lg },
          name: { fontSize: typography.fontSize.md },
        };
      default:
        return {
          container: { minWidth: 40, height: 40, borderRadius: 20 },
          icon: { fontSize: 20 },
          level: { fontSize: typography.fontSize.md },
          name: { fontSize: typography.fontSize.sm },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Generate gradient colors from the rank color
  const baseColor = rank.color;
  const lighterColor = baseColor + 'cc';
  const darkerColor = baseColor + '99';

  const renderContent = () => {
    if (variant === 'compact') {
      return (
        <View style={[styles.compactContainer, style]}>
          <Text style={[styles.icon, sizeStyles.icon]}>{rank.icon}</Text>
          {showLevel && level && (
            <Text style={[styles.compactLevel, { color: rank.color }]}>
              Lv.{level}
            </Text>
          )}
        </View>
      );
    }

    if (variant === 'full') {
      return (
        <View style={[styles.fullContainer, style]}>
          <LinearGradient
            colors={[lighterColor, baseColor, darkerColor]}
            style={[styles.fullBadge, sizeStyles.container]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.icon, sizeStyles.icon]}>{rank.icon}</Text>
          </LinearGradient>
          <View style={styles.fullInfo}>
            <Text style={[styles.fullName, { color: rank.color }]}>
              {rank.name}
            </Text>
            {showLevel && level && (
              <Text style={styles.fullLevel}>Level {level}</Text>
            )}
          </View>
        </View>
      );
    }

    // Default variant
    return (
      <View style={[styles.wrapper, style]}>
        <LinearGradient
          colors={[lighterColor, baseColor, darkerColor]}
          style={[styles.container, sizeStyles.container]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.icon, sizeStyles.icon]}>{rank.icon}</Text>
        </LinearGradient>
        {(showName || showLevel) && (
          <View style={styles.labelContainer}>
            {showName && (
              <Text style={[styles.name, sizeStyles.name, { color: rank.color }]}>
                {rank.name}
              </Text>
            )}
            {showLevel && level && (
              <Text style={[styles.level, sizeStyles.level]}>Lv.{level}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
}

// XP Progress Bar
interface XPProgressProps {
  currentXP: number;
  currentLevel: number;
  nextLevelXP?: number;
  rank: RankData;
  style?: ViewStyle;
}

export function XPProgress({
  currentXP,
  currentLevel,
  nextLevelXP = (currentLevel + 1) * 100,
  rank,
  style,
}: XPProgressProps) {
  const levelStartXP = currentLevel * 100;
  const progress = Math.min(
    ((currentXP - levelStartXP) / (nextLevelXP - levelStartXP)) * 100,
    100
  );

  return (
    <View style={[styles.xpContainer, style]}>
      <View style={styles.xpHeader}>
        <Text style={styles.xpLabel}>
          <Text style={{ color: rank.color }}>{rank.icon}</Text> {rank.name}
        </Text>
        <Text style={styles.xpText}>
          {currentXP.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.xpBarContainer}>
        <View
          style={[
            styles.xpBarFill,
            { width: `${progress}%`, backgroundColor: rank.color },
          ]}
        />
      </View>
      <View style={styles.xpFooter}>
        <Text style={styles.xpLevelText}>Level {currentLevel}</Text>
        <Text style={styles.xpLevelText}>Level {currentLevel + 1}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  icon: {
    textAlign: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  name: {
    fontWeight: typography.fontWeight.semibold,
  },
  level: {
    color: colors.textMuted,
    marginTop: 2,
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactLevel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  // Full variant
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fullBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullInfo: {
    gap: 2,
  },
  fullName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  fullLevel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // XP Progress
  xpContainer: {
    width: '100%',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  xpLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  xpLevelText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
});

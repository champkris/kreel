import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface BadgeData {
  id: string;
  name: string;
  type: string;
  icon: string;
  description?: string;
}

interface BadgeProps {
  badge: BadgeData;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const getBadgeColor = (type: string): string => {
  switch (type) {
    case 'OFFICIAL':
      return '#3b82f6'; // Blue
    case 'VERIFIED_CREATOR':
      return '#22c55e'; // Green
    case 'TOP_CONTRIBUTOR':
      return '#ffd700'; // Gold
    case 'RISING_STAR':
      return '#f97316'; // Orange
    case 'CHALLENGE_WINNER':
      return '#a855f7'; // Purple
    case 'CLUB_FOUNDER':
      return '#ec4899'; // Pink
    default:
      return colors.primary;
  }
};

export default function Badge({
  badge,
  size = 'medium',
  showLabel = false,
  onPress,
  style,
}: BadgeProps) {
  const badgeColor = getBadgeColor(badge.type);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 24, height: 24, borderRadius: 12 },
          icon: { fontSize: 12 },
          label: { fontSize: typography.fontSize.xs },
        };
      case 'large':
        return {
          container: { width: 48, height: 48, borderRadius: 24 },
          icon: { fontSize: 24 },
          label: { fontSize: typography.fontSize.md },
        };
      default:
        return {
          container: { width: 32, height: 32, borderRadius: 16 },
          icon: { fontSize: 16 },
          label: { fontSize: typography.fontSize.sm },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const content = (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          sizeStyles.container,
          { backgroundColor: badgeColor + '20', borderColor: badgeColor },
        ]}
      >
        <Text style={[styles.icon, sizeStyles.icon]}>{badge.icon}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, sizeStyles.label]} numberOfLines={1}>
          {badge.name}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Compact badge row for showing multiple badges
interface BadgeRowProps {
  badges: BadgeData[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  onPress?: (badge: BadgeData) => void;
  style?: ViewStyle;
}

export function BadgeRow({
  badges,
  maxDisplay = 3,
  size = 'small',
  onPress,
  style,
}: BadgeRowProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <View style={[styles.badgeRow, style]}>
      {displayBadges.map((badge) => (
        <Badge
          key={badge.id}
          badge={badge}
          size={size}
          onPress={onPress ? () => onPress(badge) : undefined}
        />
      ))}
      {remaining > 0 && (
        <View style={[styles.moreContainer, size === 'small' && styles.moreSmall]}>
          <Text style={styles.moreText}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

// Verified badge (checkmark) for official accounts
interface VerifiedBadgeProps {
  size?: number;
  style?: ViewStyle;
}

export function VerifiedBadge({ size = 16, style }: VerifiedBadgeProps) {
  return (
    <View
      style={[
        styles.verifiedContainer,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.verifiedIcon, { fontSize: size * 0.7 }]}>✓</Text>
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
    borderWidth: 1.5,
  },
  icon: {
    textAlign: 'center',
  },
  label: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  moreContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  moreSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  moreText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  verifiedContainer: {
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: '#ffffff',
    fontWeight: typography.fontWeight.bold,
  },
});

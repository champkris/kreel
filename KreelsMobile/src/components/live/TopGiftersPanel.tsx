import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCoins } from '../../data/giftData';

export interface TopGifter {
  id: string;
  username: string;
  avatar?: string;
  totalCoins: number;
  topGift?: {
    icon: string;
    name: string;
  };
}

interface TopGiftersPanelProps {
  gifters: TopGifter[];
  isExpanded: boolean;
  onToggle: () => void;
}

const RANK_COLORS: { [key: number]: [string, string] } = {
  1: ['#FFD700', '#FFA500'],
  2: ['#C0C0C0', '#A0A0A0'],
  3: ['#CD7F32', '#8B4513'],
};

const RANK_ICONS = ['👑', '🥈', '🥉'];

export default function TopGiftersPanel({
  gifters,
  isExpanded,
  onToggle,
}: TopGiftersPanelProps) {
  if (gifters.length === 0) return null;

  const topThree = gifters.slice(0, 3);
  const remaining = gifters.slice(3, 10);

  return (
    <View style={styles.container}>
      {/* Header / Collapsed View */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <LinearGradient
          colors={['rgba(212, 168, 75, 0.2)', 'rgba(139, 105, 20, 0.2)']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="trophy" size={16} color={colors.primary} />
            <Text style={styles.headerTitle}>Top Gifters</Text>
          </View>

          {/* Mini avatars preview */}
          <View style={styles.miniAvatars}>
            {topThree.map((gifter, index) => (
              <View
                key={gifter.id}
                style={[
                  styles.miniAvatar,
                  { zIndex: 3 - index, marginLeft: index > 0 ? -8 : 0 },
                ]}
              >
                <Text style={styles.miniAvatarText}>
                  {gifter.avatar || gifter.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Top 3 Podium */}
          <View style={styles.podium}>
            {topThree.map((gifter, index) => (
              <View
                key={gifter.id}
                style={[
                  styles.podiumItem,
                  index === 0 && styles.podiumFirst,
                ]}
              >
                <LinearGradient
                  colors={RANK_COLORS[index + 1] || (['#333', '#222'] as [string, string])}
                  style={styles.rankBadge}
                >
                  <Text style={styles.rankEmoji}>{RANK_ICONS[index]}</Text>
                </LinearGradient>

                <View style={styles.gifterAvatar}>
                  <Text style={styles.avatarText}>
                    {gifter.avatar || gifter.username.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.gifterName} numberOfLines={1}>
                  {gifter.username}
                </Text>

                <View style={styles.coinBadge}>
                  <Text style={styles.coinEmoji}>🪙</Text>
                  <Text style={styles.coinAmount}>
                    {formatCoins(gifter.totalCoins)}
                  </Text>
                </View>

                {gifter.topGift && (
                  <Text style={styles.topGiftEmoji}>{gifter.topGift.icon}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Remaining Gifters List */}
          {remaining.length > 0 && (
            <ScrollView style={styles.listContainer} nestedScrollEnabled>
              {remaining.map((gifter, index) => (
                <View key={gifter.id} style={styles.listItem}>
                  <Text style={styles.listRank}>#{index + 4}</Text>
                  <View style={styles.listAvatar}>
                    <Text style={styles.listAvatarText}>
                      {gifter.avatar || gifter.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.listName} numberOfLines={1}>
                    {gifter.username}
                  </Text>
                  <View style={styles.listCoins}>
                    <Text style={styles.coinEmoji}>🪙</Text>
                    <Text style={styles.listCoinAmount}>
                      {formatCoins(gifter.totalCoins)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  miniAvatars: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: spacing.sm,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  miniAvatarText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  expandedContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    marginBottom: spacing.md,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  rankEmoji: {
    fontSize: 14,
  },
  gifterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  gifterName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    maxWidth: 80,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  coinEmoji: {
    fontSize: 12,
  },
  coinAmount: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  topGiftEmoji: {
    fontSize: 20,
    marginTop: spacing.xs,
  },
  listContainer: {
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  listRank: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    width: 30,
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  listName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  listCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listCoinAmount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  GIFTS,
  Gift,
  GiftGoal,
  GiftLeaderboardEntry,
  MOCK_LEADERBOARD,
  MOCK_GIFT_GOAL,
  formatCoins,
  QUICK_SEND_AMOUNTS,
} from '../../data/giftData';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'gifts' | 'leaderboard';

interface LiveGiftingModalProps {
  visible: boolean;
  onClose: () => void;
  onSendGift: (gift: Gift, quantity: number) => void;
  userCoins: number;
  creatorName: string;
  giftGoal?: GiftGoal;
  leaderboard?: GiftLeaderboardEntry[];
  onTopUp?: () => void;
}

export default function LiveGiftingModal({
  visible,
  onClose,
  onSendGift,
  userCoins,
  creatorName,
  giftGoal = MOCK_GIFT_GOAL,
  leaderboard = MOCK_LEADERBOARD,
  onTopUp,
}: LiveGiftingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gifts');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Gift['category']>('basic');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const categories: { key: Gift['category']; label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'premium', label: 'Premium' },
    { key: 'special', label: 'Special' },
    { key: 'legendary', label: 'Legendary' },
  ];

  const filteredGifts = GIFTS.filter(gift => gift.category === selectedCategory);

  const handleSelectGift = (gift: Gift) => {
    setSelectedGift(gift);
    setQuantity(1);
  };

  const handleSend = () => {
    if (selectedGift) {
      onSendGift(selectedGift, quantity);
      setSelectedGift(null);
      setQuantity(1);
    }
  };

  const totalCost = selectedGift ? selectedGift.price * quantity : 0;
  const canAfford = totalCost <= userCoins;

  const goalProgress = giftGoal ? (giftGoal.currentCoins / giftGoal.targetCoins) * 100 : 0;

  const renderGiftItem = ({ item }: { item: Gift }) => {
    const isSelected = selectedGift?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.giftItem, isSelected && styles.giftItemSelected]}
        onPress={() => handleSelectGift(item)}
      >
        <Text style={styles.giftEmoji}>{item.icon}</Text>
        <Text style={styles.giftName}>{item.name}</Text>
        <View style={styles.giftPriceRow}>
          <Text style={styles.coinSmall}>🪙</Text>
          <Text style={styles.giftPrice}>{formatCoins(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: GiftLeaderboardEntry; index: number }) => {
    const getRankStyle = () => {
      if (item.rank === 1) return styles.rank1;
      if (item.rank === 2) return styles.rank2;
      if (item.rank === 3) return styles.rank3;
      return {};
    };

    const getRankIcon = () => {
      if (item.rank === 1) return '👑';
      if (item.rank === 2) return '🥈';
      if (item.rank === 3) return '🥉';
      return null;
    };

    return (
      <View style={[styles.leaderboardItem, getRankStyle()]}>
        <View style={styles.leaderboardRank}>
          {getRankIcon() ? (
            <Text style={styles.rankIcon}>{getRankIcon()}</Text>
          ) : (
            <Text style={styles.rankNumber}>{item.rank}</Text>
          )}
        </View>
        <View style={styles.leaderboardAvatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.leaderboardInfo}>
          <Text style={styles.leaderboardUsername}>{item.username}</Text>
          <Text style={styles.leaderboardStats}>
            {item.totalGifts} gifts sent
          </Text>
        </View>
        <View style={styles.leaderboardCoins}>
          <Text style={styles.coinSmall}>🪙</Text>
          <Text style={styles.leaderboardCoinsText}>{formatCoins(item.totalCoins)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Send Gift to {creatorName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.balanceText}>{formatCoins(userCoins)}</Text>
            </View>
            <TouchableOpacity style={styles.topUpButton} onPress={onTopUp}>
              <Ionicons name="add-circle" size={16} color={colors.primary} />
              <Text style={styles.topUpText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          {/* Gift Goal Progress */}
          {giftGoal && (
            <View style={styles.goalContainer}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{giftGoal.title}</Text>
                <Text style={styles.goalProgress}>
                  {formatCoins(giftGoal.currentCoins)} / {formatCoins(giftGoal.targetCoins)}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(goalProgress, 100)}%` }]}
                />
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gifts' && styles.tabActive]}
              onPress={() => setActiveTab('gifts')}
            >
              <Text style={[styles.tabText, activeTab === 'gifts' && styles.tabTextActive]}>
                Gifts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'gifts' ? (
            <>
              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
              >
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryTab,
                      selectedCategory === cat.key && styles.categoryTabActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat.key && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Gifts Grid */}
              <FlatList
                data={filteredGifts}
                renderItem={renderGiftItem}
                keyExtractor={item => item.id}
                numColumns={4}
                columnWrapperStyle={styles.giftRow}
                contentContainerStyle={styles.giftGrid}
                showsVerticalScrollIndicator={false}
              />

              {/* Quick Send */}
              {selectedGift && (
                <View style={styles.quickSendContainer}>
                  <View style={styles.selectedGiftInfo}>
                    <Text style={styles.selectedGiftEmoji}>{selectedGift.icon}</Text>
                    <View>
                      <Text style={styles.selectedGiftName}>{selectedGift.name}</Text>
                      <View style={styles.selectedGiftPrice}>
                        <Text style={styles.coinSmall}>🪙</Text>
                        <Text style={styles.priceValue}>{formatCoins(selectedGift.price)}</Text>
                      </View>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quantityScroll}
                  >
                    {QUICK_SEND_AMOUNTS.map(amount => (
                      <TouchableOpacity
                        key={amount}
                        style={[
                          styles.quantityButton,
                          quantity === amount && styles.quantityButtonActive,
                        ]}
                        onPress={() => setQuantity(amount)}
                      >
                        <Text
                          style={[
                            styles.quantityText,
                            quantity === amount && styles.quantityTextActive,
                          ]}
                        >
                          x{amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!selectedGift || !canAfford) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!selectedGift || !canAfford}
              >
                <LinearGradient
                  colors={
                    selectedGift && canAfford
                      ? [colors.primaryLight, colors.primary]
                      : [colors.surfaceLight, colors.surface]
                  }
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {selectedGift ? (
                    <>
                      <Text style={[styles.sendButtonText, !canAfford && styles.sendButtonTextDisabled]}>
                        Send {selectedGift.icon} x{quantity}
                      </Text>
                      <View style={styles.sendButtonCost}>
                        <Text style={styles.coinSmall}>🪙</Text>
                        <Text style={[styles.sendButtonCostText, !canAfford && styles.sendButtonTextDisabled]}>
                          {formatCoins(totalCost)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.sendButtonTextDisabled}>Select a gift</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <FlatList
              data={leaderboard}
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.leaderboardList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.borderRadius['2xl'],
    borderTopRightRadius: spacing.borderRadius['2xl'],
    maxHeight: '75%',
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coinEmoji: {
    fontSize: 20,
  },
  balanceText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
  },
  topUpText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  goalContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  goalProgress: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  tab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: spacing.md,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.full,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  categoryTextActive: {
    color: colors.background,
  },
  giftGrid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  giftRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  giftItem: {
    width: (screenWidth - spacing.lg * 2 - spacing.md * 3) / 4,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  giftEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  giftName: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: 2,
  },
  giftPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  coinSmall: {
    fontSize: 12,
  },
  giftPrice: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  quickSendContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedGiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  selectedGiftEmoji: {
    fontSize: 36,
  },
  selectedGiftName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  selectedGiftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceValue: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  quantityScroll: {
    maxHeight: 36,
  },
  quantityButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quantityText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  quantityTextActive: {
    color: colors.background,
  },
  sendButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: spacing.buttonBorderRadius,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  sendButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  sendButtonTextDisabled: {
    color: colors.textMuted,
  },
  sendButtonCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sendButtonCostText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  // Leaderboard styles
  leaderboardList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
  },
  rank1: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rank2: {
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  rank3: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
  },
  leaderboardRank: {
    width: 30,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 20,
  },
  rankNumber: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardUsername: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  leaderboardStats: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  leaderboardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardCoinsText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});

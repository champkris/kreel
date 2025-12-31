import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

// Daily reward tiers (7-day streak)
const DAILY_REWARDS = [
  { day: 1, coins: 10, bonus: null },
  { day: 2, coins: 15, bonus: null },
  { day: 3, coins: 20, bonus: null },
  { day: 4, coins: 25, bonus: null },
  { day: 5, coins: 30, bonus: null },
  { day: 6, coins: 40, bonus: null },
  { day: 7, coins: 100, bonus: '🎁 Weekly Bonus!' },
];

// Activity rewards
const ACTIVITY_REWARDS = [
  { id: 'watch', icon: 'play-circle', title: 'Watch Videos', description: 'Watch 5 videos today', coins: 5, progress: 3, target: 5, completed: false, category: 'engagement' },
  { id: 'like', icon: 'heart', title: 'Like Content', description: 'Like 10 videos', coins: 3, progress: 10, target: 10, completed: true, category: 'engagement' },
  { id: 'comment', icon: 'chatbubble', title: 'Leave Comments', description: 'Comment on 3 videos', coins: 5, progress: 1, target: 3, completed: false, category: 'engagement' },
  { id: 'share', icon: 'share-social', title: 'Share Videos', description: 'Share 2 videos', coins: 10, progress: 0, target: 2, completed: false, category: 'engagement' },
];

// Club activity rewards
const CLUB_REWARDS = [
  { id: 'join_club', icon: 'people', title: 'Join a Club', description: 'Join any club today', coins: 15, progress: 1, target: 1, completed: true, category: 'club' },
  { id: 'club_post', icon: 'create', title: 'Post in Club', description: 'Create a post in your club', coins: 10, progress: 0, target: 1, completed: false, category: 'club' },
  { id: 'challenge_entry', icon: 'trophy', title: 'Enter Challenge', description: 'Submit to a club challenge', coins: 20, progress: 0, target: 1, completed: false, category: 'club' },
  { id: 'challenge_vote', icon: 'thumbs-up', title: 'Vote in Challenge', description: 'Vote on 5 challenge entries', coins: 5, progress: 2, target: 5, completed: false, category: 'club' },
  { id: 'invite_member', icon: 'person-add', title: 'Invite to Club', description: 'Invite a friend to join', coins: 25, progress: 0, target: 1, completed: false, category: 'club' },
];

// Mock user reward data
const MOCK_USER_REWARDS = {
  currentStreak: 4,
  longestStreak: 12,
  totalCoinsEarned: 1250,
  lastClaimDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  canClaimToday: true,
  walletBalance: 450,
};

export default function DailyRewardsScreen() {
  const navigation = useNavigation();
  const [userRewards, setUserRewards] = useState(MOCK_USER_REWARDS);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimedCoins, setClaimedCoins] = useState(0);
  const [activityRewards, setActivityRewards] = useState(ACTIVITY_REWARDS);
  const [clubRewards, setClubRewards] = useState(CLUB_REWARDS);

  // Animation values
  const scaleAnim = useState(new Animated.Value(1))[0];
  const coinAnim = useState(new Animated.Value(0))[0];

  const currentDayReward = DAILY_REWARDS[Math.min(userRewards.currentStreak, 6)];

  const handleClaimDaily = () => {
    if (!userRewards.canClaimToday) return;

    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Show claim modal
    setClaimedCoins(currentDayReward.coins);
    setShowClaimModal(true);

    // Update state
    setUserRewards(prev => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      totalCoinsEarned: prev.totalCoinsEarned + currentDayReward.coins,
      walletBalance: prev.walletBalance + currentDayReward.coins,
      canClaimToday: false,
      lastClaimDate: new Date().toISOString(),
    }));

    // Coin animation
    Animated.timing(coinAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => coinAnim.setValue(0));
  };

  const handleClaimActivity = (rewardId: string, isClubReward: boolean = false) => {
    const rewardList = isClubReward ? clubRewards : activityRewards;
    const reward = rewardList.find(r => r.id === rewardId);
    if (!reward || !reward.completed) return;

    if (isClubReward) {
      setClubRewards(prev => prev.map(r =>
        r.id === rewardId ? { ...r, completed: false, progress: 0 } : r
      ));
    } else {
      setActivityRewards(prev => prev.map(r =>
        r.id === rewardId ? { ...r, completed: false, progress: 0 } : r
      ));
    }

    setUserRewards(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + reward.coins,
      totalCoinsEarned: prev.totalCoinsEarned + reward.coins,
    }));

    setClaimedCoins(reward.coins);
    setShowClaimModal(true);
  };

  const renderDayCard = (reward: typeof DAILY_REWARDS[0], index: number) => {
    const isPast = index < userRewards.currentStreak;
    const isCurrent = index === userRewards.currentStreak;
    const isFuture = index > userRewards.currentStreak;

    return (
      <View
        key={reward.day}
        style={[
          styles.dayCard,
          isPast && styles.dayCardPast,
          isCurrent && styles.dayCardCurrent,
        ]}
      >
        {reward.bonus && (
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusBadgeText}>BONUS</Text>
          </View>
        )}
        <Text style={[styles.dayNumber, isPast && styles.dayNumberPast]}>
          Day {reward.day}
        </Text>
        <View style={[styles.coinIcon, isCurrent && styles.coinIconCurrent]}>
          {isPast ? (
            <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
          ) : (
            <Text style={styles.coinEmoji}>🪙</Text>
          )}
        </View>
        <Text style={[styles.coinAmount, isCurrent && styles.coinAmountCurrent]}>
          +{reward.coins}
        </Text>
      </View>
    );
  };

  const renderActivityReward = (reward: typeof ACTIVITY_REWARDS[0], isClubReward: boolean = false) => {
    const progressPercent = (reward.progress / reward.target) * 100;

    return (
      <View key={reward.id} style={styles.activityCard}>
        <View style={[
          styles.activityIcon,
          reward.completed && styles.activityIconComplete,
          isClubReward && styles.activityIconClub,
          isClubReward && reward.completed && styles.activityIconClubComplete,
        ]}>
          <Ionicons
            name={reward.icon as any}
            size={24}
            color={reward.completed ? '#22c55e' : isClubReward ? '#a855f7' : colors.textMuted}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{reward.title}</Text>
          <Text style={styles.activityDesc}>{reward.description}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                  isClubReward && styles.progressBarClub,
                  reward.completed && styles.progressBarComplete,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {reward.progress}/{reward.target}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.claimButton,
            !reward.completed && styles.claimButtonDisabled,
            isClubReward && reward.completed && styles.claimButtonClub,
          ]}
          onPress={() => handleClaimActivity(reward.id, isClubReward)}
          disabled={!reward.completed}
        >
          <Text style={[
            styles.claimButtonText,
            !reward.completed && styles.claimButtonTextDisabled,
          ]}>
            {reward.completed ? `+${reward.coins}` : `${reward.coins}`}
          </Text>
          <Text style={styles.coinSmall}>🪙</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Rewards</Text>
        <View style={styles.walletBadge}>
          <Text style={styles.walletAmount}>{userRewards.walletBalance}</Text>
          <Text style={styles.walletCoin}>🪙</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak Banner */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.streakBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.streakInfo}>
            <View style={styles.streakIcon}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakCount}>{userRewards.currentStreak} Days</Text>
            </View>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{userRewards.longestStreak}</Text>
              <Text style={styles.streakStatLabel}>Best</Text>
            </View>
            <View style={styles.streakStatDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{userRewards.totalCoinsEarned}</Text>
              <Text style={styles.streakStatLabel}>Total Earned</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Daily Check-in */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Check-in</Text>
          <Text style={styles.sectionSubtitle}>
            Log in every day to earn bonus coins!
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {DAILY_REWARDS.map((reward, index) => renderDayCard(reward, index))}
          </ScrollView>

          {/* Claim Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.claimDailyButton,
                !userRewards.canClaimToday && styles.claimDailyButtonDisabled,
              ]}
              onPress={handleClaimDaily}
              disabled={!userRewards.canClaimToday}
            >
              <LinearGradient
                colors={userRewards.canClaimToday
                  ? [colors.primary, colors.primaryDark]
                  : [colors.surfaceLight, colors.surface]
                }
                style={styles.claimDailyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {userRewards.canClaimToday ? (
                  <>
                    <Text style={styles.claimDailyText}>Claim +{currentDayReward.coins}</Text>
                    <Text style={styles.claimDailyCoin}>🪙</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={colors.textMuted} />
                    <Text style={styles.claimDailyTextDisabled}>Claimed Today</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Activity Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="videocam" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Content Rewards</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Watch and engage with content to earn coins!
          </Text>

          {activityRewards.map(reward => renderActivityReward(reward, false))}
        </View>

        {/* Club Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="people" size={20} color="#a855f7" />
            <Text style={[styles.sectionTitle, { color: '#a855f7' }]}>Club Rewards</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Participate in clubs and challenges for bonus coins!
          </Text>

          {clubRewards.map(reward => renderActivityReward(reward, true))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text>📅</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Daily Login</Text>
                <Text style={styles.infoDesc}>
                  Claim coins every day. Streak resets if you miss a day.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text>🔥</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Build Streaks</Text>
                <Text style={styles.infoDesc}>
                  Longer streaks = bigger rewards. Day 7 bonus: 100 coins!
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text>💰</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Use Coins</Text>
                <Text style={styles.infoDesc}>
                  Unlock premium content, join exclusive challenges, and more!
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Claim Success Modal */}
      <Modal
        visible={showClaimModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClaimModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClaimModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalEmoji}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>Reward Claimed!</Text>
            <View style={styles.modalReward}>
              <Text style={styles.modalCoins}>+{claimedCoins}</Text>
              <Text style={styles.modalCoinIcon}>🪙</Text>
            </View>
            <Text style={styles.modalSubtext}>
              Coins added to your wallet
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowClaimModal(false)}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    gap: spacing.xs,
  },
  walletAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  walletCoin: {
    fontSize: 16,
  },
  // Streak Banner
  streakBanner: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  streakCount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  streakStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.xs,
  },
  streakStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Section
  section: {
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
  },
  // Day Cards
  daysContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dayCard: {
    width: 80,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardPast: {
    opacity: 0.6,
  },
  dayCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  bonusBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#ffd700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  bonusBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  dayNumber: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.sm,
  },
  dayNumberPast: {
    color: colors.textMuted,
  },
  coinIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  coinIconCurrent: {
    transform: [{ scale: 1.2 }],
  },
  coinEmoji: {
    fontSize: 28,
  },
  coinAmount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  coinAmountCurrent: {
    color: colors.primary,
  },
  // Claim Button
  claimDailyButton: {
    marginTop: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  claimDailyButtonDisabled: {
    opacity: 0.7,
  },
  claimDailyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  claimDailyText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  claimDailyTextDisabled: {
    color: colors.textMuted,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  claimDailyCoin: {
    fontSize: 24,
  },
  // Activity Rewards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconComplete: {
    backgroundColor: '#22c55e20',
  },
  activityIconClub: {
    backgroundColor: '#a855f720',
  },
  activityIconClubComplete: {
    backgroundColor: '#22c55e20',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  activityDesc: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressBarComplete: {
    backgroundColor: '#22c55e',
  },
  progressBarClub: {
    backgroundColor: '#a855f7',
  },
  progressText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    minWidth: 35,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    gap: spacing.xs,
  },
  claimButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  claimButtonClub: {
    backgroundColor: '#a855f7',
  },
  claimButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  claimButtonTextDisabled: {
    color: colors.textMuted,
  },
  coinSmall: {
    fontSize: 14,
  },
  // Info Card
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  infoDesc: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  modalReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalCoins: {
    color: colors.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  modalCoinIcon: {
    fontSize: 32,
  },
  modalSubtext: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xl,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    width: '100%',
  },
  modalButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
});

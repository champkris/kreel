import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Coupon {
  id: string;
  title: string;
  validUntil: string;
  icon: string;
}

export default function CouponsRewardsScreen() {
  const navigation = useNavigation();

  // Mock data
  const rewardPoints = 350;
  const coupons: Coupon[] = [
    {
      id: '1',
      title: '10% Off Coupon',
      validUntil: 'March 30, 2025',
      icon: 'pricetag',
    },
    {
      id: '2',
      title: 'Free Gift Coupon',
      validUntil: 'April 15, 2025',
      icon: 'gift',
    },
  ];

  const handleUseCoupon = (coupon: Coupon) => {
    Alert.alert('Use Coupon', `Apply ${coupon.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Use Now',
        onPress: () => Alert.alert('Success', 'Coupon applied!'),
      },
    ]);
  };

  const handleRewardPointsPress = () => {
    Alert.alert('Reward Points', 'View your reward points history and redemption options.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons & Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reward Points Card */}
        <TouchableOpacity onPress={handleRewardPointsPress}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.rewardCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.rewardContent}>
              <Text style={styles.rewardLabel}>Reward Points</Text>
              <Text style={styles.rewardPoints}>{rewardPoints}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textPrimary}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Coupons Section */}
        <Text style={styles.sectionTitle}>Coupons</Text>

        {coupons.map((coupon) => (
          <View key={coupon.id} style={styles.couponItem}>
            <View style={styles.couponLeft}>
              <View style={styles.couponIcon}>
                <Ionicons
                  name={coupon.icon as any}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.couponInfo}>
                <Text style={styles.couponTitle}>{coupon.title}</Text>
                <Text style={styles.couponValid}>
                  Valid until: {coupon.validUntil}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.useButton}
              onPress={() => handleUseCoupon(coupon)}
            >
              <Text style={styles.useButtonText}>Use Now</Text>
            </TouchableOpacity>
          </View>
        ))}

        {coupons.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No coupons available</Text>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  rewardContent: {},
  rewardLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    opacity: 0.9,
  },
  rewardPoints: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  couponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  couponInfo: {
    flex: 1,
  },
  couponTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  couponValid: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  useButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  useButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },
});

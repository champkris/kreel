import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface FeatureItem {
  id: string;
  feature: string;
  light: string | boolean;
  pro: string | boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const features: FeatureItem[] = [
  {
    id: '1',
    feature: 'Watch Content',
    light: 'Free episodes only',
    pro: 'All content (Free + Premium + Exclusive)',
    icon: 'play-circle-outline',
  },
  {
    id: '2',
    feature: 'Video Quality',
    light: 'Standard (720p)',
    pro: 'HD & 4K',
    icon: 'tv-outline',
  },
  {
    id: '3',
    feature: 'Advertisements',
    light: 'Ads between episodes',
    pro: 'Ad-free experience',
    icon: 'ban-outline',
  },
  {
    id: '4',
    feature: 'Join Clubs',
    light: 'Up to 3 clubs',
    pro: 'Unlimited clubs',
    icon: 'people-outline',
  },
  {
    id: '5',
    feature: 'Create Clubs',
    light: false,
    pro: true,
    icon: 'add-circle-outline',
  },
  {
    id: '6',
    feature: 'Daily Rewards',
    light: 'Standard rewards',
    pro: '2x rewards bonus',
    icon: 'gift-outline',
  },
  {
    id: '7',
    feature: 'Offline Downloads',
    light: false,
    pro: true,
    icon: 'download-outline',
  },
  {
    id: '8',
    feature: 'Live Stream Priority',
    light: 'Standard access',
    pro: 'Priority access + Front row',
    icon: 'radio-outline',
  },
  {
    id: '9',
    feature: 'Early Access',
    light: false,
    pro: 'New releases 24h early',
    icon: 'time-outline',
  },
  {
    id: '10',
    feature: 'Exclusive Badges',
    light: false,
    pro: 'Pro member badge',
    icon: 'ribbon-outline',
  },
];

export default function UpgradeProScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      `You selected the ${selectedPlan} plan. This will redirect to payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Process payment') },
      ]
    );
  };

  const renderFeatureValue = (value: string | boolean, isPro: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Ionicons name="checkmark-circle" size={20} color={isPro ? colors.success : colors.textMuted} />
      ) : (
        <Ionicons name="close-circle" size={20} color={colors.error} />
      );
    }
    return (
      <Text style={[styles.featureValue, isPro && styles.featureValuePro]} numberOfLines={2}>
        {value}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.proBadge}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock the Full Kreels Experience</Text>
          <Text style={styles.heroSubtitle}>
            Watch everything, create more, and enjoy exclusive perks
          </Text>
        </LinearGradient>

        {/* Plan Selection */}
        <View style={styles.planSection}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Monthly</Text>
              {selectedPlan === 'monthly' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
            <Text style={styles.planPrice}>$9.99</Text>
            <Text style={styles.planPeriod}>per month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 40%</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Yearly</Text>
              {selectedPlan === 'yearly' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
            <Text style={styles.planPrice}>$71.88</Text>
            <Text style={styles.planPeriod}>$5.99/month, billed annually</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Compare Plans</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.featureColumn}>
              <Text style={styles.columnLabel}>Feature</Text>
            </View>
            <View style={styles.planColumn}>
              <Text style={styles.columnLabel}>Light</Text>
              <Text style={styles.columnSubLabel}>Free</Text>
            </View>
            <View style={[styles.planColumn, styles.proColumn]}>
              <Text style={[styles.columnLabel, styles.proLabel]}>Pro</Text>
              <Text style={[styles.columnSubLabel, styles.proSubLabel]}>Premium</Text>
            </View>
          </View>

          {/* Feature Rows */}
          {features.map((item, index) => (
            <View
              key={item.id}
              style={[styles.featureRow, index % 2 === 0 && styles.featureRowAlt]}
            >
              <View style={styles.featureColumn}>
                <View style={styles.featureInfo}>
                  <Ionicons name={item.icon} size={18} color={colors.textMuted} />
                  <Text style={styles.featureName}>{item.feature}</Text>
                </View>
              </View>
              <View style={styles.planColumn}>
                {renderFeatureValue(item.light, false)}
              </View>
              <View style={[styles.planColumn, styles.proColumn]}>
                {renderFeatureValue(item.pro, true)}
              </View>
            </View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialQuote}>
            "Pro membership is totally worth it. No ads, 4K quality, and I get early access to all new releases!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Sarah K., Pro Member</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Upgrade Button */}
      <View style={styles.upgradeContainer}>
        <TouchableOpacity onPress={handleUpgrade}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.upgradeButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.upgradeButtonText}>
              Upgrade to Pro - {selectedPlan === 'monthly' ? '$9.99/mo' : '$5.99/mo'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.cancelText}>Cancel anytime. Terms apply.</Text>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  headerRight: {
    width: 32,
  },
  heroSection: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: spacing.borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  proBadgeText: {
    color: '#FFD700',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  heroTitle: {
    color: colors.background,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  planSection: {
    flexDirection: 'row',
    padding: spacing.screenPadding,
    gap: spacing.md,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.success,
    borderRadius: spacing.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  saveBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  planPeriod: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  comparisonSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureColumn: {
    flex: 2,
  },
  planColumn: {
    flex: 1.2,
    alignItems: 'center',
  },
  proColumn: {
    backgroundColor: colors.primary + '10',
    marginLeft: spacing.xs,
    marginRight: -spacing.screenPadding,
    paddingRight: spacing.screenPadding,
    borderTopRightRadius: spacing.borderRadius.md,
  },
  columnLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  columnSubLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  proLabel: {
    color: colors.primary,
  },
  proSubLabel: {
    color: colors.primary,
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  featureRowAlt: {
    backgroundColor: colors.surface,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  featureValue: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  featureValuePro: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  testimonialSection: {
    padding: spacing.screenPadding,
    marginTop: spacing.lg,
  },
  testimonialQuote: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 120,
  },
  upgradeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upgradeButton: {
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

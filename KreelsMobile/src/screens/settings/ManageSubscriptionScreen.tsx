import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function ManageSubscriptionScreen() {
  const navigation = useNavigation();
  const [autoRenew, setAutoRenew] = useState(true);

  // Mock subscription data
  const subscription = {
    plan: 'Yearly',
    price: '$48.99',
    nextBillingDate: 'Aug 21, 2024',
  };

  const handleUpgradePlan = () => {
    Alert.alert('Upgrade Plan', 'Choose a plan to upgrade to.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View Plans', onPress: () => {} },
    ]);
  };

  const handleDowngradePlan = () => {
    Alert.alert('Downgrade Plan', 'Choose a plan to downgrade to.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View Plans', onPress: () => {} },
    ]);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.'),
        },
      ]
    );
  };

  const toggleAutoRenew = () => {
    setAutoRenew(!autoRenew);
    Alert.alert(
      autoRenew ? 'Auto-Renew Disabled' : 'Auto-Renew Enabled',
      autoRenew
        ? 'Your subscription will not automatically renew.'
        : 'Your subscription will automatically renew.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Ionicons name="diamond" size={32} color={colors.primary} />
            <Text style={styles.planTitle}>Current Plan</Text>
          </View>
          <Text style={styles.planPrice}>
            {subscription.price} / {subscription.plan}
          </Text>

          {/* Auto Renew */}
          <View style={styles.autoRenewRow}>
            <Text style={styles.autoRenewLabel}>Auto-Renew</Text>
            <Switch
              value={autoRenew}
              onValueChange={toggleAutoRenew}
              trackColor={{
                false: colors.surface,
                true: colors.primary,
              }}
              thumbColor={colors.textPrimary}
              ios_backgroundColor={colors.surface}
            />
          </View>

          {/* Next Billing */}
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next Billing Date</Text>
            <Text style={styles.billingDate}>{subscription.nextBillingDate}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleUpgradePlan}
          >
            <Text style={styles.actionItemText}>Upgrade Plan</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleDowngradePlan}
          >
            <Text style={styles.actionItemText}>Downgrade Plan</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, styles.cancelItem]}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelItemText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
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
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  autoRenewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  autoRenewLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: spacing.md,
  },
  billingLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
  billingDate: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
  actionItemText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  cancelItem: {
    backgroundColor: colors.surface,
  },
  cancelItemText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});

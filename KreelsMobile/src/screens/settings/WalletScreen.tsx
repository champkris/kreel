import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCoins } from '../../data/giftData';

export default function WalletScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Mock wallet data
  const walletBalance = 120.45;
  const coinsBalance = 540;

  const handleAddFunds = () => {
    Alert.alert('Add Funds', 'Add funds feature coming soon!');
  };

  const handleAddCoins = () => {
    navigation.navigate('TopUp');
  };

  const handlePaymentMethods = () => {
    Alert.alert('Payment Methods', 'Payment methods feature coming soon!');
  };

  const handleTransactionHistory = () => {
    Alert.alert('Transaction History', 'Transaction history feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primaryDark]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceAmount}>
              ${walletBalance.toFixed(2)}
            </Text>
            <Text style={styles.coinsAmount}>🪙 {formatCoins(coinsBalance)} Coins</Text>
          </View>
          {/* Decorative elements */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={handleAddFunds}
          >
            <Ionicons name="diamond-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addCoinsButton}
            onPress={handleAddCoins}
          >
            <Ionicons name="logo-bitcoin" size={18} color={colors.background} />
            <Text style={styles.addCoinsText}>Add Coins</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePaymentMethods}
          >
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTransactionHistory}
          >
            <Text style={styles.menuItemText}>Transaction History</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
  balanceCard: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceContent: {
    zIndex: 1,
  },
  balanceLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  coinsAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    opacity: 0.9,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    right: 40,
    bottom: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  addFundsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  addFundsText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  addCoinsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  addCoinsText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionContainer: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});

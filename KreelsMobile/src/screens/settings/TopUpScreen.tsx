import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { COIN_PACKAGES, PAYMENT_METHODS, formatCoins, formatPrice, CoinPackage, PaymentMethod } from '../../data/giftData';

export default function TopUpScreen() {
  const navigation = useNavigation();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(PAYMENT_METHODS[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock current balance
  const currentBalance = 540;

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment) return;

    setIsProcessing(true);

    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setShowPaymentModal(false);

    const totalCoins = selectedPackage.coins + selectedPackage.bonusCoins;
    Alert.alert(
      'Purchase Successful!',
      `You received ${totalCoins} coins!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderCoinPackage = (pkg: CoinPackage) => {
    const totalCoins = pkg.coins + pkg.bonusCoins;

    return (
      <TouchableOpacity
        key={pkg.id}
        style={[
          styles.packageCard,
          pkg.popular && styles.packageCardPopular,
          pkg.bestValue && styles.packageCardBestValue,
        ]}
        onPress={() => handleSelectPackage(pkg)}
      >
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
        )}
        {pkg.bestValue && (
          <View style={[styles.popularBadge, styles.bestValueBadge]}>
            <Text style={styles.popularBadgeText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.packageHeader}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinAmount}>{formatCoins(pkg.coins)}</Text>
        </View>

        {pkg.bonusCoins > 0 && (
          <View style={styles.bonusContainer}>
            <Text style={styles.bonusText}>+{formatCoins(pkg.bonusCoins)} BONUS</Text>
          </View>
        )}

        <Text style={styles.totalCoins}>
          {formatCoins(totalCoins)} total
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(pkg.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPayment?.id === method.id && styles.paymentMethodSelected,
      ]}
      onPress={() => setSelectedPayment(method)}
    >
      <View style={styles.paymentMethodIcon}>
        <Ionicons
          name={method.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={selectedPayment?.id === method.id ? colors.primary : colors.textPrimary}
        />
      </View>
      <Text style={[
        styles.paymentMethodText,
        selectedPayment?.id === method.id && styles.paymentMethodTextSelected,
      ]}>
        {method.name}
      </Text>
      {selectedPayment?.id === method.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Coins</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Balance */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primaryDark]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Your Coin Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.balanceAmount}>{formatCoins(currentBalance)}</Text>
            </View>
          </View>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </LinearGradient>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Send gifts to your favorite creators during live streams!
          </Text>
        </View>

        {/* Coin Packages */}
        <Text style={styles.sectionTitle}>Choose a Package</Text>
        <View style={styles.packagesGrid}>
          {COIN_PACKAGES.map(renderCoinPackage)}
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By purchasing, you agree to our Terms of Service. Coins are non-refundable.
        </Text>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Purchase</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedPackage && (
              <View style={styles.purchaseSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Coins</Text>
                  <Text style={styles.summaryValue}>
                    🪙 {formatCoins(selectedPackage.coins + selectedPackage.bonusCoins)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Price</Text>
                  <Text style={styles.summaryPrice}>{formatPrice(selectedPackage.price)}</Text>
                </View>
              </View>
            )}

            <Text style={styles.paymentTitle}>Payment Method</Text>
            {PAYMENT_METHODS.map(renderPaymentMethod)}

            <TouchableOpacity
              style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                style={styles.purchaseButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    Pay {selectedPackage && formatPrice(selectedPackage.price)}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  balanceCard: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    minHeight: 120,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.lg,
  },
  balanceContent: {
    zIndex: 1,
  },
  balanceLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coinEmoji: {
    fontSize: 32,
  },
  balanceAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  packageCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  packageCardPopular: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  packageCardBestValue: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: spacing.borderRadius.sm,
  },
  bestValueBadge: {
    backgroundColor: colors.success,
  },
  popularBadgeText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  coinIcon: {
    fontSize: 24,
  },
  coinAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  bonusContainer: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.full,
    marginBottom: spacing.xs,
  },
  bonusText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  totalCoins: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  termsText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.borderRadius['2xl'],
    borderTopRightRadius: spacing.borderRadius['2xl'],
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  purchaseSummary: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryPrice: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  paymentTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodSelected: {
    borderColor: colors.primary,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentMethodText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  paymentMethodTextSelected: {
    color: colors.primary,
  },
  purchaseButton: {
    marginTop: spacing.lg,
    borderRadius: spacing.buttonBorderRadius,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});

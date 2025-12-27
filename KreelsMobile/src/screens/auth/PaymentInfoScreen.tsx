import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button, Input } from '../../components/common';

interface Props {
  onComplete: (data: PaymentData) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

interface PaymentData {
  payoutMethod: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
}

const payoutMethods = [
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'stripe', label: 'Stripe' },
];

export default function PaymentInfoScreen({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
  });

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    if (!formData.accountHolderName || !formData.bankName || !formData.accountNumber) {
      Alert.alert('Required', 'Please fill in all payment details');
      return;
    }
    onComplete({
      payoutMethod: selectedMethod,
      ...formData,
    });
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Information</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Payment Information</Text>
          <Text style={styles.description}>
            To receive your earnings, add your pay-out details. Your information is securely encrypted.
          </Text>

          {/* Payout Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Payout Method</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>
                {payoutMethods.find(m => m.id === selectedMethod)?.label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.methodOptions}>
              {payoutMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodOption,
                    selectedMethod === method.id && styles.methodOptionSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      selectedMethod === method.id && styles.methodTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                  {selectedMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bank Details Form */}
          {selectedMethod === 'bank_transfer' && (
            <View style={styles.formSection}>
              <Input
                label="Account Holder Name"
                placeholder="Full Name"
                value={formData.accountHolderName}
                onChangeText={updateFormData('accountHolderName')}
              />

              <Input
                label="Bank Name"
                placeholder="City Bank LTD"
                value={formData.bankName}
                onChangeText={updateFormData('bankName')}
              />

              <Input
                label="IBAN/Account Number"
                placeholder="1311 0214 6541 0554"
                value={formData.accountNumber}
                onChangeText={updateFormData('accountNumber')}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* PayPal Form */}
          {selectedMethod === 'paypal' && (
            <View style={styles.formSection}>
              <Input
                label="PayPal Email"
                placeholder="your@email.com"
                value={formData.accountHolderName}
                onChangeText={updateFormData('accountHolderName')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Stripe Form */}
          {selectedMethod === 'stripe' && (
            <View style={styles.formSection}>
              <Input
                label="Stripe Account Email"
                placeholder="your@email.com"
                value={formData.accountHolderName}
                onChangeText={updateFormData('accountHolderName')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Security Notice */}
          <View style={styles.securityBox}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Secure & Encrypted</Text>
              <Text style={styles.securityText}>
                Your payment information is protected with bank-level encryption.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleComplete}
          variant="primary"
          fullWidth
        />
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  stepText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
  },
  title: {
    color: colors.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  selectText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  methodOptions: {
    gap: spacing.sm,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(212, 168, 75, 0.05)',
  },
  methodText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  methodTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    gap: spacing.md,
    alignItems: 'center',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  securityText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});

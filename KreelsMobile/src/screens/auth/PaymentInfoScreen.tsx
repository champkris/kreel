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
import { verificationAPI } from '../../services/api';

interface Props {
  onComplete: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const payoutMethods = [
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'PAYPAL', label: 'PayPal' },
  { id: 'STRIPE', label: 'Stripe' },
];

export default function PaymentInfoScreen({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState('BANK_TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    paypalEmail: '',
    stripeEmail: '',
  });

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (selectedMethod === 'BANK_TRANSFER') {
      if (!formData.bankAccountName || !formData.bankName || !formData.bankAccountNumber) {
        Alert.alert('Required', 'Please fill in all bank details');
        return false;
      }
    } else if (selectedMethod === 'PAYPAL') {
      if (!formData.paypalEmail) {
        Alert.alert('Required', 'Please enter your PayPal email');
        return false;
      }
    } else if (selectedMethod === 'STRIPE') {
      if (!formData.stripeEmail) {
        Alert.alert('Required', 'Please enter your Stripe email');
        return false;
      }
    }
    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Submit payment info
      const paymentResponse = await verificationAPI.submitPayment({
        payoutMethod: selectedMethod,
        bankAccountName: selectedMethod === 'BANK_TRANSFER' ? formData.bankAccountName : undefined,
        bankName: selectedMethod === 'BANK_TRANSFER' ? formData.bankName : undefined,
        bankAccountNumber: selectedMethod === 'BANK_TRANSFER' ? formData.bankAccountNumber : undefined,
        paypalEmail: selectedMethod === 'PAYPAL' ? formData.paypalEmail : undefined,
        stripeEmail: selectedMethod === 'STRIPE' ? formData.stripeEmail : undefined,
      });

      if (!paymentResponse.success) {
        Alert.alert('Error', paymentResponse.error?.message || 'Failed to submit payment information');
        return;
      }

      // Submit for review
      const submitResponse = await verificationAPI.submitForReview();

      if (submitResponse.success) {
        Alert.alert(
          'Verification Submitted!',
          'Your verification documents have been submitted for review. We will notify you once the review is complete.',
          [{ text: 'OK', onPress: onComplete }]
        );
      } else {
        Alert.alert('Error', submitResponse.error?.message || 'Failed to submit for review');
      }
    } catch (error: any) {
      console.error('Error submitting payment info:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to submit payment information'
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <View style={styles.methodOptions}>
              {payoutMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodOption,
                    selectedMethod === method.id && styles.methodOptionSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={isSubmitting}
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
          {selectedMethod === 'BANK_TRANSFER' && (
            <View style={styles.formSection}>
              <Input
                label="Account Holder Name"
                placeholder="Full Name"
                value={formData.bankAccountName}
                onChangeText={updateFormData('bankAccountName')}
                editable={!isSubmitting}
              />

              <Input
                label="Bank Name"
                placeholder="City Bank LTD"
                value={formData.bankName}
                onChangeText={updateFormData('bankName')}
                editable={!isSubmitting}
              />

              <Input
                label="IBAN/Account Number"
                placeholder="1311 0214 6541 0554"
                value={formData.bankAccountNumber}
                onChangeText={updateFormData('bankAccountNumber')}
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>
          )}

          {/* PayPal Form */}
          {selectedMethod === 'PAYPAL' && (
            <View style={styles.formSection}>
              <Input
                label="PayPal Email"
                placeholder="your@email.com"
                value={formData.paypalEmail}
                onChangeText={updateFormData('paypalEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          )}

          {/* Stripe Form */}
          {selectedMethod === 'STRIPE' && (
            <View style={styles.formSection}>
              <Input
                label="Stripe Account Email"
                placeholder="your@email.com"
                value={formData.stripeEmail}
                onChangeText={updateFormData('stripeEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
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
          title={isSubmitting ? 'Submitting...' : 'Complete Verification'}
          onPress={handleComplete}
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
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

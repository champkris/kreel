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
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button, Card } from '../../components/common';

interface Props {
  onContinue: (data: { documentType: string; documentImage: string | null }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const documentTypes = [
  { id: 'utility', label: 'Utility Bill' },
  { id: 'phone', label: 'Phone Bill' },
  { id: 'bank', label: 'Bank Statement' },
];

export default function AddressVerificationScreen({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [selectedDocType, setSelectedDocType] = useState('utility');
  const [documentImage, setDocumentImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocumentImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!documentImage) {
      Alert.alert('Required', 'Please upload your address document');
      return;
    }
    onContinue({ documentType: selectedDocType, documentImage });
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
        <Text style={styles.headerTitle}>Address Verification</Text>
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
          <Text style={styles.title}>Verify your Address</Text>
          <Text style={styles.description}>
            Upload a document showing your full name & residential address. Accepted: Utility bill, phone bill, bank statement. Must be issued within the last 3 months.
          </Text>

          {/* Document Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Document Type</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectText}>
                  {documentTypes.find(d => d.id === selectedDocType)?.label}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Dropdown options */}
              <View style={styles.dropdownContainer}>
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.dropdownOption,
                      selectedDocType === type.id && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => setSelectedDocType(type.id)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selectedDocType === type.id && styles.dropdownTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upload Image</Text>
            <TouchableOpacity onPress={handlePickImage}>
              <Card variant="outlined" style={styles.uploadCard}>
                {documentImage ? (
                  <View style={styles.uploadedContainer}>
                    <Ionicons name="document-attach" size={40} color={colors.primary} />
                    <Text style={styles.uploadedText}>Document uploaded</Text>
                    <Text style={styles.changeText}>Tap to change</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={40} color={colors.textMuted} />
                    <Text style={styles.uploadText}>JPEG PNG or PDF - Max 10 MB</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Document Requirements:</Text>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.requirementText}>Shows your full name clearly</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.requirementText}>Shows your residential address</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.requirementText}>Issued within the last 3 months</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
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
  selectContainer: {
    gap: spacing.sm,
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
  },
  selectText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(212, 168, 75, 0.1)',
  },
  dropdownText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  dropdownTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  uploadCard: {
    borderStyle: 'dashed',
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  uploadedContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadedText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  changeText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  requirementsBox: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
  },
  requirementsTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});

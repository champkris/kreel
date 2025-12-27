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
  onContinue: (data: { idType: string; idImage: string | null }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const idTypes = [
  { id: 'passport', label: 'Passport' },
  { id: 'national_id', label: 'National ID' },
  { id: 'drivers_license', label: "Driver's License" },
];

export default function IdentityVerificationScreen({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [selectedIdType, setSelectedIdType] = useState('national_id');
  const [idImage, setIdImage] = useState<string | null>(null);

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
      setIdImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!idImage) {
      Alert.alert('Required', 'Please upload your ID document');
      return;
    }
    onContinue({ idType: selectedIdType, idImage });
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
        <Text style={styles.headerTitle}>Identity Verification</Text>
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
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.description}>
            Upload a government-issued ID to verify your identity. This helps us ensure the security of our creator community.
          </Text>

          {/* ID Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Document Type</Text>
            <View style={styles.idTypeContainer}>
              {idTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.idTypeOption,
                    selectedIdType === type.id && styles.idTypeOptionSelected,
                  ]}
                  onPress={() => setSelectedIdType(type.id)}
                >
                  <Text
                    style={[
                      styles.idTypeText,
                      selectedIdType === type.id && styles.idTypeTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                  {selectedIdType === type.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upload Image</Text>
            <TouchableOpacity onPress={handlePickImage}>
              <Card variant="outlined" style={styles.uploadCard}>
                {idImage ? (
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

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Make sure all details are clearly visible and the document is not expired.
            </Text>
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
  idTypeContainer: {
    gap: spacing.sm,
  },
  idTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(212, 168, 75, 0.05)',
  },
  idTypeText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  idTypeTextSelected: {
    color: colors.textPrimary,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});

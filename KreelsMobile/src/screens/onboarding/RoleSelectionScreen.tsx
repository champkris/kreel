import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/common';

type UserRole = 'individual' | 'professional';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'individual',
    title: 'Individual',
    description: 'Watch, explore, and connect with creators you love.',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Create, monetize, and grow your audience on (reels).',
  },
];

interface Props {
  onContinue: (role: UserRole) => void;
  onBack?: () => void;
}

export default function RoleSelectionScreen({ onContinue, onBack }: Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');

  const handleContinue = () => {
    onContinue(selectedRole);
  };

  const renderRoleCard = (option: RoleOption) => {
    const isSelected = selectedRole === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.roleCard,
          isSelected && styles.roleCardSelected,
        ]}
        onPress={() => setSelectedRole(option.id)}
        activeOpacity={0.8}
      >
        <View style={styles.roleContent}>
          <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
            {option.title}
          </Text>
          <Text style={styles.roleDescription}>{option.description}</Text>
        </View>

        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>Choose how you want to experience KREELS.</Text>
        </View>

        <View style={styles.optionsContainer}>
          {roleOptions.map(renderRoleCard)}
        </View>
      </View>

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
  backButton: {
    padding: spacing.base,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
  optionsContainer: {
    gap: spacing.base,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(212, 168, 75, 0.05)',
  },
  roleContent: {
    flex: 1,
    marginRight: spacing.base,
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  roleTitleSelected: {
    color: colors.primary,
  },
  roleDescription: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['2xl'],
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { useProfileCompletionStore, PROFILE_FIELD_LABELS } from '../../store/profileCompletionStore';
import { usersAPI } from '../../services/api';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const { fetchCompletion, missingFields } = useProfileCompletionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    country: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        country: (user as any).country || '',
        dateOfBirth: (user as any).dateOfBirth
          ? new Date((user as any).dateOfBirth).toISOString().split('T')[0]
          : '',
        phone: (user as any).phone || '',
        gender: (user as any).gender || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Prepare data for API
      const updateData: Record<string, any> = {};

      if (formData.displayName) updateData.displayName = formData.displayName;
      if (formData.username) updateData.username = formData.username;
      if (formData.bio !== undefined) updateData.bio = formData.bio;
      if (formData.country) updateData.country = formData.country;
      if (formData.phone !== undefined) updateData.phone = formData.phone;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

      const response = await usersAPI.updateProfile(user.id, updateData);

      if (response.success) {
        // Update local user state
        setUser({ ...user, ...response.data });

        // Refresh profile completion
        await fetchCompletion();

        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isFieldMissing = (key: string) => {
    return missingFields.includes(key);
  };

  const formFields = [
    { label: 'Display Name', value: formData.displayName, key: 'displayName', required: true },
    { label: 'Username', value: formData.username, key: 'username', required: true },
    { label: 'Bio', value: formData.bio, key: 'bio', required: true, multiline: true },
    { label: 'Country', value: formData.country, key: 'country', required: true },
    { label: 'Date of Birth', value: formData.dateOfBirth, key: 'dateOfBirth', required: true, placeholder: 'YYYY-MM-DD' },
    { label: 'Phone', value: formData.phone, key: 'phone', required: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info</Text>
        <TouchableOpacity
          onPress={isEditing ? handleSave : handleEdit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={isEditing ? 'checkmark' : 'pencil'}
              size={22}
              color={isEditing ? colors.primary : colors.textPrimary}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Missing Fields Notice */}
        {missingFields.length > 0 && !isEditing && (
          <View style={styles.missingNotice}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <Text style={styles.missingNoticeText}>
              Complete your profile to unlock all features
            </Text>
          </View>
        )}

        {/* Form Fields */}
        {formFields.map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {isFieldMissing(field.key) && (
                <View style={styles.missingBadge}>
                  <Text style={styles.missingBadgeText}>Missing</Text>
                </View>
              )}
            </View>
            {isEditing ? (
              <TextInput
                style={[
                  styles.fieldInput,
                  field.multiline && styles.multilineInput,
                  isFieldMissing(field.key) && styles.missingFieldInput,
                ]}
                value={field.value}
                onChangeText={(text) => updateField(field.key, text)}
                placeholderTextColor={colors.textMuted}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
              />
            ) : (
              <Text style={[styles.fieldValue, !field.value && styles.emptyValue]}>
                {field.value || 'Not set'}
              </Text>
            )}
          </View>
        ))}

        {/* Gender Field - Special handling */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Gender</Text>
            {isFieldMissing('gender') && (
              <View style={styles.missingBadge}>
                <Text style={styles.missingBadgeText}>Missing</Text>
              </View>
            )}
          </View>
          {isEditing ? (
            <View style={styles.genderContainer}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    formData.gender === option && styles.genderOptionSelected,
                  ]}
                  onPress={() => updateField('gender', option)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === option && styles.genderOptionTextSelected,
                    ]}
                  >
                    {GENDER_LABELS[option]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.fieldValue, !formData.gender && styles.emptyValue]}>
              {formData.gender ? GENDER_LABELS[formData.gender] : 'Not set'}
            </Text>
          )}
        </View>

        {/* Save Button (when editing) */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
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
  missingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  missingNoticeText: {
    color: '#FF9800',
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  missingBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  missingBadgeText: {
    color: '#FF5252',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  fieldValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  emptyValue: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  fieldInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  missingFieldInput: {
    borderColor: '#FF5252',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  genderOptionText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  genderOptionTextSelected: {
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#000',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});

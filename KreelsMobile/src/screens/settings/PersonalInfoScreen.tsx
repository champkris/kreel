import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';

interface FormField {
  label: string;
  value: string;
  key: string;
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || 'Jane Cooper',
    email: user?.email || 'your@email.com',
    country: 'Canada',
    city: 'Toronto',
    postalCode: '1920',
    dob: '12/2/2000',
    phone: '+32123 456 789',
    type: 'Singer',
    gender: 'Male',
    about: 'Live Singer, guitarist, performer.',
    category: '',
  });

  const formFields: FormField[] = [
    { label: 'Full Name', value: formData.fullName, key: 'fullName' },
    { label: 'Email for Invoice', value: formData.email, key: 'email' },
    { label: 'Country', value: formData.country, key: 'country' },
    { label: 'City', value: formData.city, key: 'city' },
    { label: 'Postal Code', value: formData.postalCode, key: 'postalCode' },
    { label: 'D.O.B', value: formData.dob, key: 'dob' },
    { label: 'Phone', value: formData.phone, key: 'phone' },
    { label: 'Type', value: formData.type, key: 'type' },
    { label: 'Gender', value: formData.gender, key: 'gender' },
    { label: 'About', value: formData.about, key: 'about' },
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : handleEdit}>
          <Ionicons
            name={isEditing ? 'checkmark' : 'pencil'}
            size={22}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Fields */}
        {formFields.map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={field.value}
                onChangeText={(text) => updateField(field.key, text)}
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>{field.value}</Text>
            )}
          </View>
        ))}

        {/* Category Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Select Category</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>
              {formData.category || 'Choose one'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

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
  fieldContainer: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  fieldInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  selectButtonText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.lg,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});

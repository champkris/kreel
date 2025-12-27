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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface PreferenceItem {
  id: string;
  title: string;
  key: keyof PreferencesState;
}

interface PreferencesState {
  autoplayVideos: boolean;
  allowComments: boolean;
  autoSaveUploads: boolean;
  downloadOverWifi: boolean;
}

export default function PreferencesScreen() {
  const navigation = useNavigation();

  const [preferences, setPreferences] = useState<PreferencesState>({
    autoplayVideos: true,
    allowComments: false,
    autoSaveUploads: true,
    downloadOverWifi: true,
  });

  const preferenceItems: PreferenceItem[] = [
    { id: '1', title: 'Autoplay videos', key: 'autoplayVideos' },
    { id: '2', title: 'Allow comments by default', key: 'allowComments' },
    { id: '3', title: 'Auto-save uploads', key: 'autoSaveUploads' },
    { id: '4', title: 'Download over Wi-Fi only', key: 'downloadOverWifi' },
  ];

  const togglePreference = (key: keyof PreferencesState) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {preferenceItems.map((item) => (
          <View key={item.id} style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>{item.title}</Text>
            <Switch
              value={preferences[item.key]}
              onValueChange={() => togglePreference(item.key)}
              trackColor={{
                false: colors.surface,
                true: colors.primary,
              }}
              thumbColor={colors.textPrimary}
              ios_backgroundColor={colors.surface}
            />
          </View>
        ))}
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
    gap: spacing.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
  preferenceText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    paddingRight: spacing.md,
  },
});

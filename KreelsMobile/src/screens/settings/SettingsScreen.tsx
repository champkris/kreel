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
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';

interface SettingsItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  color?: string;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person-outline',
      route: 'PersonalInfo',
    },
    {
      id: 'creator',
      title: 'Creator Dashboard',
      icon: 'grid-outline',
      route: 'CreatorDashboard',
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'settings-outline',
      route: 'AccountSettings',
    },
    {
      id: 'wallet',
      title: 'Wallet & coins',
      icon: 'wallet-outline',
      route: 'Wallet',
    },
    {
      id: 'coupons',
      title: 'Coupons & Reward',
      icon: 'gift-outline',
      route: 'CouponsRewards',
    },
    {
      id: 'device',
      title: 'Manage Device',
      icon: 'phone-portrait-outline',
      route: 'ManageDevice',
    },
    {
      id: 'subscription',
      title: 'Manage Subscription',
      icon: 'card-outline',
      route: 'ManageSubscription',
    },
    {
      id: 'upgrade',
      title: 'Upgrade to professional',
      icon: 'diamond-outline',
      route: 'UpgradePro',
    },
  ];

  const handleItemPress = (item: SettingsItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      navigation.navigate(item.route as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Settings Items */}
        <View style={styles.settingsContainer}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsItem}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={colors.textPrimary}
                />
                <Text style={styles.settingsItemText}>{item.title}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.settingsItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingsItemText, styles.logoutText]}>
                Logout
              </Text>
            </View>
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
  settingsContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsItemText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  logoutItem: {
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.primary,
  },
});

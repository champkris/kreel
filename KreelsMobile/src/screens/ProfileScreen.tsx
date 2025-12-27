import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';

const { width: screenWidth } = Dimensions.get('window');
const gridItemWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3;

// Mock data
const userStats = {
  posts: 1374,
  followers: 2480,
  following: 1374,
};

const userPosts = [
  { id: '1', title: 'Post 1', views: 125, likes: 41, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=400&fit=crop' },
  { id: '2', title: 'Post 2', views: 89, likes: 23, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop' },
  { id: '3', title: 'Post 3', views: 156, likes: 67, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=400&fit=crop' },
  { id: '4', title: 'Post 4', views: 234, likes: 89, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=400&fit=crop' },
  { id: '5', title: 'Post 5', views: 178, likes: 45, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=400&fit=crop' },
  { id: '6', title: 'Post 6', views: 312, likes: 102, image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=400&fit=crop' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const handleCreatorDashboard = () => {
    navigation.navigate('CreatorDashboard' as never);
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit Profile feature coming soon!');
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

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

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>
                {user?.displayName?.[0] || 'U'}
              </Text>
            </LinearGradient>
          </View>

          {/* Name */}
          <Text style={styles.userName}>
            @{user?.username || 'andrew_ainsley'}
          </Text>
          <Text style={styles.userBio}>
            Live Singer, guitarist, performer.
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(userStats.posts)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(userStats.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(userStats.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={16} color={colors.textPrimary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Creator Dashboard Button */}
        <View style={styles.dashboardSection}>
          <TouchableOpacity onPress={handleCreatorDashboard}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              style={styles.dashboardButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.dashboardContent}>
                <Ionicons name="analytics" size={24} color={colors.background} />
                <View style={styles.dashboardText}>
                  <Text style={styles.dashboardTitle}>Creator Dashboard</Text>
                  <Text style={styles.dashboardSubtitle}>View your analytics and earnings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.background} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        <View style={styles.contentSection}>
          <View style={styles.contentGrid}>
            {userPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.contentItem}>
                <ImageBackground
                  source={{ uri: post.image }}
                  style={styles.contentImage}
                  imageStyle={{ borderRadius: spacing.borderRadius.md }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.contentOverlay}>
                    <View style={styles.contentStats}>
                      <Ionicons name="play" size={12} color={colors.textPrimary} />
                      <Text style={styles.contentStatText}>{post.views}</Text>
                    </View>
                    <View style={styles.contentStats}>
                      <Ionicons name="heart" size={12} color={colors.textPrimary} />
                      <Text style={styles.contentStatText}>{post.likes}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
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
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.background,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  userBio: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statNumber: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.buttonBorderRadius,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  dashboardSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
  dashboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dashboardText: {
    gap: 2,
  },
  dashboardTitle: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  dashboardSubtitle: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: typography.fontSize.sm,
  },
  contentSection: {
    paddingHorizontal: spacing.screenPadding,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  contentItem: {
    width: gridItemWidth,
  },
  contentImage: {
    width: gridItemWidth,
    height: gridItemWidth * 1.3,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
  },
  contentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contentStatText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
  },
  logoutSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});

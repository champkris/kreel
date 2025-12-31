import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';
import { usersAPI, videosAPI } from '../services/api';
import { Badge, BadgeRow, VerifiedBadge, RankBadge, XPProgress } from '../components/common';
import type { BadgeData, RankData } from '../components/common';
import {
  RANK_TIERS,
  getRankByLevel,
  getNextRank,
  getRankProgress,
  getLevelsToNextRank,
} from '../utils/rankingSystem';

const { width: screenWidth } = Dimensions.get('window');
const gridItemWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3;

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  userType: string;
  experiencePoints: number;
  currentLevel: number;
  currentRank?: RankData;
  badges: BadgeData[];
  followersCount: number;
  followingCount: number;
  videosCount: number;
}

interface VideoPost {
  id: string;
  title: string;
  thumbnail?: string;
  viewCount: number;
  likeCount: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchVideos();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile(user!.id);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await videosAPI.getCreatorVideos(user!.id);
      if (response.success) {
        setVideos(response.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleCreatorDashboard = () => {
    navigation.navigate('CreatorDashboard' as never);
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit Profile feature coming soon!');
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handleBadgePress = (badge: BadgeData) => {
    Alert.alert(badge.name, badge.description || 'Badge earned for your achievements!');
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Default rank if not loaded
  const defaultRank: RankData = {
    name: 'Rookie',
    icon: '🌱',
    color: '#22c55e',
  };

  const currentRank = profile?.currentRank || defaultRank;
  const hasOfficialBadge = profile?.badges?.some(b => b.type === 'OFFICIAL');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Avatar with Rank */}
          <View style={styles.avatarContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>
                  {profile?.displayName?.[0] || user?.displayName?.[0] || 'U'}
                </Text>
              </LinearGradient>
            )}
            {/* Rank Badge overlay */}
            <View style={styles.rankOverlay}>
              <RankBadge rank={currentRank} size="small" />
            </View>
          </View>

          {/* Name with verified badge */}
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>
              @{profile?.username || user?.username || 'user'}
            </Text>
            {hasOfficialBadge && <VerifiedBadge size={18} style={styles.verifiedBadge} />}
          </View>

          {/* Display name */}
          <Text style={styles.displayName}>
            {profile?.displayName || user?.displayName || 'User'}
          </Text>

          {/* Bio */}
          <Text style={styles.userBio}>
            {profile?.bio || 'No bio yet'}
          </Text>

          {/* Badges Row */}
          {profile?.badges && profile.badges.length > 0 && (
            <View style={styles.badgesSection}>
              <BadgeRow
                badges={profile.badges}
                maxDisplay={5}
                size="medium"
                onPress={handleBadgePress}
              />
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(profile?.videosCount || 0)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(profile?.followersCount || 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(profile?.followingCount || 0)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={16} color={colors.textPrimary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <XPProgress
            currentXP={profile?.experiencePoints || 0}
            currentLevel={profile?.currentLevel || 1}
            rank={currentRank}
          />
        </View>

        {/* Ranking Card */}
        {(() => {
          const level = profile?.currentLevel || 1;
          const rankTier = getRankByLevel(level);
          const nextRank = getNextRank(rankTier);
          const progress = getRankProgress(level, rankTier);
          const levelsToNext = getLevelsToNextRank(level, rankTier);

          return (
            <View style={styles.rankingSection}>
              <Text style={styles.sectionTitle}>My Rank</Text>
              <View style={styles.rankingCard}>
                {/* Official Badge Banner */}
                {hasOfficialBadge && (
                  <View style={styles.officialBanner}>
                    <Ionicons name="shield-checkmark" size={16} color="#fff" />
                    <Text style={styles.officialBannerText}>Official Creator</Text>
                  </View>
                )}

                {/* Current Rank */}
                <View style={styles.currentRankRow}>
                  <View style={styles.rankIconLarge}>
                    <Text style={styles.rankIconText}>{rankTier.icon}</Text>
                  </View>
                  <View style={styles.rankDetails}>
                    <Text style={[styles.rankName, { color: rankTier.color }]}>
                      {rankTier.name}
                    </Text>
                    <Text style={styles.rankLevel}>Level {level}</Text>
                  </View>
                </View>

                {/* Progress to Next Rank */}
                {nextRank && (
                  <View style={styles.nextRankSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress to {nextRank.name}</Text>
                      <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={[rankTier.color, nextRank.color]}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={styles.levelsRemaining}>
                      {levelsToNext} levels to {nextRank.icon} {nextRank.name}
                    </Text>
                  </View>
                )}

                {/* Rank Tiers Preview */}
                <View style={styles.tierPreview}>
                  {RANK_TIERS.slice(0, 5).map((tier, index) => {
                    const isCurrentTier = tier.id === rankTier.id;
                    const isPastTier = tier.minLevel < rankTier.minLevel;
                    return (
                      <View
                        key={tier.id}
                        style={[
                          styles.tierDot,
                          isCurrentTier && { backgroundColor: tier.color, transform: [{ scale: 1.3 }] },
                          isPastTier && { backgroundColor: tier.color, opacity: 0.5 },
                        ]}
                      >
                        <Text style={styles.tierDotIcon}>{tier.icon}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })()}

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
          <Text style={styles.sectionTitle}>My Content</Text>
          {videos.length > 0 ? (
            <View style={styles.contentGrid}>
              {videos.map((post) => (
                <TouchableOpacity key={post.id} style={styles.contentItem}>
                  <ImageBackground
                    source={{ uri: post.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=400&fit=crop' }}
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
                        <Text style={styles.contentStatText}>{formatNumber(post.viewCount)}</Text>
                      </View>
                      <View style={styles.contentStats}>
                        <Ionicons name="heart" size={12} color={colors.textPrimary} />
                        <Text style={styles.contentStatText}>{formatNumber(post.likeCount)}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Ionicons name="videocam-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No videos yet</Text>
              <Text style={styles.emptySubtext}>Start creating to share your content!</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarInitial: {
    color: colors.background,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  rankOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  userName: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  userBio: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  badgesSection: {
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
  xpSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
  },
  // Ranking Section
  rankingSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
  },
  rankingCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  officialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: spacing.sm,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  officialBannerText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  currentRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  rankIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIconText: {
    fontSize: 32,
  },
  rankDetails: {
    flex: 1,
  },
  rankName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  rankLevel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: 2,
  },
  nextRankSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  progressValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelsRemaining: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tierPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tierDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierDotIcon: {
    fontSize: 18,
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
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
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
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

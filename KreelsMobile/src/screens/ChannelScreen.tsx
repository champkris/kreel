import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Badge, BadgeRow, VerifiedBadge, RankBadge, XPProgress } from '../components/common';
import type { BadgeData, RankData } from '../components/common';
import VideoCard from '../components/video/VideoCard';
import { mockVideos } from '../data/seedData';
import { Video } from '../types';
import { usersAPI, videosAPI } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

export type ChannelParams = {
  Channel: {
    id: string;
    name: string;
    avatar?: string;
  };
};

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
  isFollowing?: boolean;
}

export default function ChannelScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ChannelParams, 'Channel'>>();
  const { id, name, avatar } = route.params;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchVideos();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile(id);
      if (response.success) {
        setProfile(response.data);
        setIsFollowing(response.data.isFollowing || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await videosAPI.getCreatorVideos(id);
      if (response.success) {
        setChannelVideos(response.data);
      } else {
        // Fallback to mock data
        setChannelVideos(mockVideos.slice(0, 9));
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setChannelVideos(mockVideos.slice(0, 9));
    }
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

  const cardWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3;

  const handleVideoPress = (video: Video) => {
    console.log('Video pressed:', video.title);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(id);
        setIsFollowing(false);
      } else {
        await usersAPI.followUser(id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
      // Toggle anyway for demo
      setIsFollowing(!isFollowing);
    }
  };

  const handleBadgePress = (badge: BadgeData) => {
    // Could show badge detail modal
    console.log('Badge pressed:', badge.name);
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar with Rank */}
          <View style={styles.avatarContainer}>
            {profile?.avatar || avatar ? (
              <Image source={{ uri: profile?.avatar || avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>
                  {profile?.displayName?.[0] || name[0]}
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
            <Text style={styles.channelName}>
              {profile?.displayName || name}
            </Text>
            {hasOfficialBadge && <VerifiedBadge size={20} style={styles.verifiedBadge} />}
          </View>
          <Text style={styles.channelHandle}>
            @{profile?.username || name.toLowerCase().replace(/\s/g, '_')}
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
              <Text style={styles.statValue}>{formatNumber(profile?.followersCount || 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(profile?.followingCount || 0)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(profile?.videosCount || 0)}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{profile?.bio || 'No bio yet'}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Ionicons
              name="grid-outline"
              size={22}
              color={activeTab === 'videos' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={activeTab === 'about' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'videos' ? (
          <View style={styles.videosGrid}>
            {channelVideos.length > 0 ? (
              channelVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPress={handleVideoPress}
                  width={cardWidth}
                  showCreator={false}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="videocam-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No videos yet</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.aboutSection}>
            {/* XP Progress */}
            <View style={styles.xpSection}>
              <XPProgress
                currentXP={profile?.experiencePoints || 0}
                currentLevel={profile?.currentLevel || 1}
                rank={currentRank}
              />
            </View>

            <View style={styles.aboutItem}>
              <Ionicons name="videocam-outline" size={20} color={colors.textMuted} />
              <Text style={styles.aboutText}>{profile?.videosCount || 0} Videos</Text>
            </View>
            <View style={styles.aboutItem}>
              <Ionicons name="trophy-outline" size={20} color={colors.textMuted} />
              <Text style={styles.aboutText}>Level {profile?.currentLevel || 1} • {currentRank.name}</Text>
            </View>
            <View style={styles.aboutItem}>
              <Ionicons name="star-outline" size={20} color={colors.textMuted} />
              <Text style={styles.aboutText}>{formatNumber(profile?.experiencePoints || 0)} XP earned</Text>
            </View>
            <View style={styles.aboutItem}>
              <Ionicons name="ribbon-outline" size={20} color={colors.textMuted} />
              <Text style={styles.aboutText}>{profile?.badges?.length || 0} Badges earned</Text>
            </View>
          </View>
        )}

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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  moreButton: {
    padding: spacing.xs,
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
  avatarInitial: {
    color: colors.background,
    fontSize: 40,
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
  channelName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  channelHandle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
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
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
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
  bio: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  followingButtonText: {
    color: colors.textPrimary,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  aboutSection: {
    padding: spacing.screenPadding,
    gap: spacing.lg,
  },
  xpSection: {
    marginBottom: spacing.md,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  emptyState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.md,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});

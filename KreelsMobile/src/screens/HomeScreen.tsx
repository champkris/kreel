import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ViewAllType } from './ViewAllScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import VideoCard from '../components/video/VideoCard';
import VideoPlayer from '../components/video/VideoPlayer';
import SwipeableVideoPlayer from '../components/video/SwipeableVideoPlayer';
import { Video } from '../types';
import { seriesAPI, usersAPI } from '../services/api';
import {
  mockVideos,
  getVideosByCategory,
  formatViews,
  getFollowingVideos,
  getTrendingVideos,
  getDramaVideos,
  getLiveVideos,
  getFollowedChannels,
} from '../data/seedData';
import NotificationBadge from '../components/notifications/NotificationBadge';

// Channel type for API response
interface Channel {
  id: string;
  username: string;
  displayName?: string;
  name?: string; // For mock data compatibility
  avatar?: string;
  followersCount: number;
  videosCount: number;
}

const { width: screenWidth } = Dimensions.get('window');

// Calculate card width for grid
// On web, limit container width to mobile-like dimensions
const effectiveWidth = Platform.OS === 'web' ? Math.min(screenWidth, 428) : screenWidth;
// Available width = screen - (2 * padding) - (2 * gaps between 3 columns)
const gridCardWidth = Math.floor((effectiveWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3);

type TabType = 'Following' | 'Trending' | 'Drama' | 'Live';

const continueWatching = mockVideos.slice(0, 4).map((video, index) => ({
  ...video,
  progress: Math.random() * 100,
  episodeNumber: index + 1,
  totalEpisodes: 20,
}));

// Fallback mock series data
const mockSeriesData = mockVideos.slice(0, 6).map((video, index) => ({
  ...video,
  badge: index === 0 ? 'Free' : index < 3 ? 'Premium' : 'Exclusive',
}));

interface SeriesItem {
  id: string;
  title: string;
  thumbnail?: string;
  thumbnailUrl?: string; // For backward compatibility with mock data
  episodeCounts?: {
    free: number;
    locked: number;
    paid: number;
    total: number;
  };
  badge?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('Trending');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showSwipeablePlayer, setShowSwipeablePlayer] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [seriesData, setSeriesData] = useState<SeriesItem[]>([]);
  const [followedChannels, setFollowedChannels] = useState<Channel[]>([]);

  useEffect(() => {
    fetchSeries();
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await usersAPI.getCreators(1, 10);
      if (response.success && response.data?.length > 0) {
        setFollowedChannels(response.data);
      } else {
        // Fallback to mock data
        setFollowedChannels(getFollowedChannels());
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      // Fallback to mock data
      setFollowedChannels(getFollowedChannels());
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await seriesAPI.getSeries(1, 10);
      console.log('Series API response:', response);
      if (response.success && response.data?.length > 0) {
        const series = response.data.map((s: any, index: number) => ({
          id: s.id,
          title: s.title,
          thumbnail: s.thumbnail,
          thumbnailUrl: s.thumbnail, // For compatibility
          episodeCounts: s.episodeCounts,
          badge: s.episodeCounts?.free > 0 ? 'Free' : s.isPaid ? 'Premium' : 'Exclusive',
        }));
        setSeriesData(series);
      } else {
        // Fallback to mock data
        setSeriesData(mockSeriesData);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      setSeriesData(mockSeriesData);
    }
  };

  const tabs: TabType[] = ['Following', 'Trending', 'Drama', 'Live'];

  const handleViewAll = (type: ViewAllType, title: string) => {
    navigation.navigate('ViewAll', { type, title });
  };

  const handleChannelPress = (channel: Channel) => {
    navigation.navigate('Channel', {
      id: channel.id,
      name: channel.displayName || channel.name || channel.username,
      avatar: channel.avatar || undefined,
    });
  };

  const handleVideoPress = (video: Video) => {
    const videos = getVideosByCategory('Popular');
    const videoIndex = videos.findIndex(v => v.id === video.id);
    setSelectedVideoIndex(videoIndex >= 0 ? videoIndex : 0);
    setSelectedVideo(video);
    setShowSwipeablePlayer(true);
  };

  const handleSeriesPress = (series: SeriesItem) => {
    navigation.navigate('SeriesDetail', {
      id: series.id,
      title: series.title,
      thumbnail: series.thumbnail,
    });
  };

  const handleClosePlayer = () => {
    setShowSwipeablePlayer(false);
    setSelectedVideo(null);
  };

  const handleLogoPress = () => {
    // Reset to default state - Trending tab and scroll to top
    setActiveTab('Trending');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
        <Image
          source={require('../../assets/Kreels_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        {/* Daily Rewards Button */}
        <TouchableOpacity
          style={styles.dailyRewardsButton}
          onPress={() => navigation.navigate('DailyRewards')}
        >
          <Text style={styles.dailyRewardsEmoji}>🪙</Text>
          <View style={styles.dailyRewardsDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <NotificationBadge size={24} color={colors.textPrimary} />
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFeaturedBanner = () => {
    const featured = mockVideos[0];
    return (
      <TouchableOpacity
        style={styles.featuredBanner}
        onPress={() => handleVideoPress(featured)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={{ uri: featured.thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Content overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.featuredOverlay}
          />
        </ImageBackground>

        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {featured.description}
          </Text>

          <View style={styles.featuredActions}>
            <TouchableOpacity style={styles.playButton}>
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="play" size={20} color={colors.background} />
                <Text style={styles.playButtonText}>Play</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addListButton}>
              <Ionicons name="add" size={20} color={colors.textPrimary} />
              <Text style={styles.addListText}>My List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFollowedChannels = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Followed Channel</Text>
        <TouchableOpacity onPress={() => handleViewAll('followed_channels', 'Followed Channels')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={followedChannels}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.channelList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.channelItem}
            onPress={() => handleChannelPress(item)}
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.channelAvatar} />
            ) : (
              <View style={styles.channelAvatar}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.channelInitial}>{(item.displayName || item.name || item.username || '?')[0]}</Text>
              </View>
            )}
            <Text style={styles.channelName} numberOfLines={1}>{item.displayName || item.name || item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderContinueWatching = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Continue Watching</Text>
        <TouchableOpacity onPress={() => handleViewAll('continue_watching', 'Continue Watching')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={continueWatching}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.continueList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => handleVideoPress(item)}
          >
            <View style={styles.continueImage}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
              </View>
            </View>

            <Text style={styles.continueTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.continueEpisode}>
              Episode {item.episodeNumber}/{item.totalEpisodes}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderSeries = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Series</Text>
        <TouchableOpacity onPress={() => handleViewAll('series', 'Series')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={seriesData}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.seriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.seriesCard}
            onPress={() => handleSeriesPress(item)}
          >
            <View style={styles.seriesImage}>
              <Image
                source={{ uri: item.thumbnail || item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />

              {/* Badge */}
              <View
                style={[
                  styles.seriesBadge,
                  item.badge === 'Free' && styles.badgeFree,
                  item.badge === 'Premium' && styles.badgePremium,
                  item.badge === 'Exclusive' && styles.badgeExclusive,
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            </View>

            <Text style={styles.seriesTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.seriesViews}>
              {item.episodeCounts?.total || 0} episodes
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderTrendingNow = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <TouchableOpacity onPress={() => handleViewAll('trending', 'Trending Now')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trendingGrid}>
        {mockVideos.slice(0, 6).map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPress={handleVideoPress}
            width={gridCardWidth}
          />
        ))}
      </View>
    </View>
  );

  // Following Tab Content
  const renderFollowingContent = () => {
    const followingVideos = getFollowingVideos();

    if (followingVideos.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No Following Yet</Text>
          <Text style={styles.emptyStateText}>
            Follow your favorite creators to see their content here
          </Text>
        </View>
      );
    }

    return (
      <>
        {renderFollowedChannels()}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>From Creators You Follow</Text>
          </View>
          <View style={styles.trendingGrid}>
            {followingVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={handleVideoPress}
                width={gridCardWidth}
              />
            ))}
          </View>
        </View>
      </>
    );
  };

  // Trending Tab Content (default)
  const renderTrendingContent = () => (
    <>
      {renderFeaturedBanner()}
      {renderFollowedChannels()}
      {renderContinueWatching()}
      {renderSeries()}
      {renderTrendingNow()}
    </>
  );

  // Drama Tab Content
  const renderDramaContent = () => {
    const dramaVideos = getDramaVideos();
    const featuredDrama = dramaVideos[0];

    return (
      <>
        {featuredDrama && (
          <TouchableOpacity
            style={styles.featuredBanner}
            onPress={() => handleVideoPress(featuredDrama)}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: featuredDrama.thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.featuredOverlay}
              />
            </ImageBackground>
            <View style={styles.featuredContent}>
              <View style={styles.dramaBadge}>
                <Text style={styles.dramaBadgeText}>DRAMA</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredDrama.title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredDrama.description}
              </Text>
              <View style={styles.featuredActions}>
                <TouchableOpacity style={styles.playButton}>
                  <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    style={styles.playButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="play" size={20} color={colors.background} />
                    <Text style={styles.playButtonText}>Watch Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Dramas</Text>
            <TouchableOpacity onPress={() => handleViewAll('drama', 'Popular Dramas')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trendingGrid}>
            {dramaVideos.slice(1, 10).map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={handleVideoPress}
                width={gridCardWidth}
              />
            ))}
          </View>
        </View>
      </>
    );
  };

  // Live Tab Content
  const renderLiveContent = () => {
    const liveVideos = getLiveVideos();

    return (
      <>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            <View style={styles.liveDot} />
          </View>
          <FlatList
            horizontal
            data={liveVideos}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.liveCard}
                onPress={() => handleVideoPress(item)}
              >
                <View style={styles.liveImage}>
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                  <View style={styles.liveOverlay}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDotSmall} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <View style={styles.viewerCount}>
                      <Ionicons name="eye" size={12} color={colors.textPrimary} />
                      <Text style={styles.viewerText}>{formatViews(item.views)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.liveTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.liveCreator}>{item.user?.displayName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Streams</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No upcoming streams scheduled</Text>
          </View>
        </View>
      </>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Following':
        return renderFollowingContent();
      case 'Trending':
        return renderTrendingContent();
      case 'Drama':
        return renderDramaContent();
      case 'Live':
        return renderLiveContent();
      default:
        return renderTrendingContent();
    }
  };

  if (showSwipeablePlayer) {
    const videos = getVideosByCategory('Popular');
    return (
      <SwipeableVideoPlayer
        videos={videos}
        initialIndex={selectedVideoIndex}
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {renderHeader()}
      {renderTabs()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTabContent()}

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
  logo: {
    width: 100,
    height: 32,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerIcon: {
    padding: spacing.xs,
  },
  dailyRewardsButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  dailyRewardsEmoji: {
    fontSize: 22,
  },
  dailyRewardsDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  tab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  // Featured Banner
  featuredBanner: {
    height: 280,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  featuredTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  featuredDescription: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  playButton: {
    borderRadius: spacing.buttonBorderRadius,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  playButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  addListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: spacing.buttonBorderRadius,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  addListText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  // Followed Channels
  channelList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  channelItem: {
    alignItems: 'center',
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  channelInitial: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  channelName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
    width: 60,
  },
  // Continue Watching
  continueList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  continueCard: {
    width: 140,
  },
  continueImage: {
    width: 140,
    height: 80,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.surfaceLight,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  continueTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  continueEpisode: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // Series
  seriesList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  seriesCard: {
    width: 120,
  },
  seriesImage: {
    width: 120,
    height: 160,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  seriesBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  badgeFree: {
    backgroundColor: colors.success,
  },
  badgePremium: {
    backgroundColor: colors.primary,
  },
  badgeExclusive: {
    backgroundColor: '#9C27B0',
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  seriesTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  seriesViews: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  // Trending Grid
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.screenPadding,
  },
  emptyStateTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  // Drama Badge
  dramaBadge: {
    backgroundColor: '#8A2BE2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  dramaBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  // Live Styles
  liveList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  liveCard: {
    width: 200,
  },
  liveImage: {
    width: 200,
    height: 120,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  liveOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
  },
  liveText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
    alignSelf: 'flex-end',
    gap: 4,
  },
  viewerText: {
    color: colors.textPrimary,
    fontSize: 10,
  },
  liveTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  liveCreator: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});

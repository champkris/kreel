import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import VideoCard from '../components/video/VideoCard';
import { Video } from '../types';
import {
  mockVideos,
  getVideosByCategory,
  getFollowingVideos,
  getTrendingVideos,
  getDramaVideos,
} from '../data/seedData';

const { width: screenWidth } = Dimensions.get('window');

export type ViewAllType =
  | 'followed_channels'
  | 'continue_watching'
  | 'series'
  | 'trending'
  | 'following'
  | 'drama'
  | 'popular'
  | 'new_releases'
  | 'trending_clubs'
  | 'trending_creators'
  | 'trending_livestreams'
  | 'trending_talents'
  // Genre types
  | 'genre_romance'
  | 'genre_drama'
  | 'genre_thriller'
  | 'genre_action'
  | 'genre_fantasy'
  | 'genre_comedy'
  | 'genre_horror'
  | 'genre_sci-fi'
  | 'genre_sports'
  | 'genre_mystery'
  | string; // Allow any genre_* type

type ViewAllParams = {
  ViewAll: {
    type: ViewAllType;
    title: string;
  };
};

// Mock data for Explore screen content
const newReleases = [
  { id: '1', title: 'The Last Kingdom', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop' },
  { id: '2', title: 'Dark Romance', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=600&fit=crop' },
  { id: '3', title: 'City Lights', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=600&fit=crop' },
  { id: '4', title: 'Eternal Love', image: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=600&fit=crop' },
  { id: '5', title: 'Midnight Sun', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop' },
  { id: '6', title: 'Ocean Dreams', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop' },
];

const trendingClubs = [
  { id: '1', name: 'K-Drama Fans', members: '12K', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=200&h=200&fit=crop' },
  { id: '2', name: 'Action Movies', members: '8K', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=200&h=200&fit=crop' },
  { id: '3', name: 'Romance', members: '15K', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=200&fit=crop' },
  { id: '4', name: 'Thriller', members: '6K', image: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=200&h=200&fit=crop' },
  { id: '5', name: 'Fantasy World', members: '9K', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop' },
  { id: '6', name: 'Comedy Central', members: '11K', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200&h=200&fit=crop' },
];

const trendingCreators = [
  { id: '1', name: 'John Doe', followers: '50K', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '2', name: 'Jane Smith', followers: '120K', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: '3', name: 'Mike Johnson', followers: '80K', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: '4', name: 'Sarah Lee', followers: '200K', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { id: '5', name: 'Alex Chen', followers: '75K', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop' },
  { id: '6', name: 'Emma Wilson', followers: '95K', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' },
];

const trendingLivestreams = [
  { id: '1', title: 'Live Concert', creator: 'Olivia', viewers: '5.1K', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=500&fit=crop' },
  { id: '2', title: 'Q&A Session', creator: 'Mike', viewers: '3.2K', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=500&fit=crop' },
  { id: '3', title: 'Behind Scenes', creator: 'Sarah', viewers: '2.8K', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=500&fit=crop' },
  { id: '4', title: 'Gaming Night', creator: 'Alex', viewers: '4.5K', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop' },
  { id: '5', title: 'Cooking Show', creator: 'Emma', viewers: '1.9K', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=500&fit=crop' },
  { id: '6', title: 'Talk Show', creator: 'John', viewers: '3.7K', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=500&fit=crop' },
];

const getVideosForType = (type: ViewAllType): Video[] => {
  // Handle genre types (genre_*)
  if (type.startsWith('genre_')) {
    const genre = type.replace('genre_', '').toLowerCase();
    return mockVideos.filter(video =>
      video.tags.some(tag => tag.toLowerCase().includes(genre) || genre.includes(tag.toLowerCase()))
    );
  }

  switch (type) {
    case 'following':
      return getFollowingVideos();
    case 'trending':
    case 'popular':
      return getTrendingVideos();
    case 'drama':
      return getDramaVideos();
    case 'series':
      return mockVideos.slice(0, 12);
    case 'continue_watching':
      return mockVideos.slice(0, 8);
    case 'followed_channels':
      return getFollowingVideos();
    case 'new_releases':
      return mockVideos.slice(0, 12);
    default:
      return mockVideos;
  }
};

const isVideoType = (type: ViewAllType): boolean => {
  return ['followed_channels', 'continue_watching', 'series', 'trending', 'following', 'drama', 'popular', 'new_releases'].includes(type);
};

export default function ViewAllScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ViewAllParams, 'ViewAll'>>();
  const { type, title } = route.params;

  const videos = getVideosForType(type);
  const cardWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3;

  const handleVideoPress = (video: Video) => {
    console.log('Video pressed:', video.title);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="film-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyStateTitle}>No Content Available</Text>
      <Text style={styles.emptyStateText}>
        Check back later for more content
      </Text>
    </View>
  );

  // Render club card
  const renderClubCard = ({ item }: { item: typeof trendingClubs[0] }) => (
    <TouchableOpacity style={styles.clubCard}>
      <Image source={{ uri: item.image }} style={styles.clubImage} />
      <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.clubMembers}>{item.members} Members</Text>
    </TouchableOpacity>
  );

  // Render creator card
  const renderCreatorCard = ({ item }: { item: typeof trendingCreators[0] }) => (
    <TouchableOpacity style={styles.creatorCard}>
      <Image source={{ uri: item.image }} style={styles.creatorImage} />
      <Text style={styles.creatorName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.creatorFollowers}>{item.followers} Followers</Text>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render livestream card
  const renderLivestreamCard = ({ item }: { item: typeof trendingLivestreams[0] }) => (
    <TouchableOpacity style={styles.livestreamCard}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.livestreamImage}
        imageStyle={{ borderRadius: spacing.borderRadius.md }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.livestreamGradient}
        />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={12} color={colors.textPrimary} />
          <Text style={styles.viewerText}>{item.viewers}</Text>
        </View>
      </ImageBackground>
      <Text style={styles.livestreamTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.livestreamCreator}>By {item.creator}</Text>
    </TouchableOpacity>
  );

  // Render content based on type
  const renderContent = () => {
    if (type === 'trending_clubs') {
      return (
        <FlatList
          data={trendingClubs}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={renderClubCard}
        />
      );
    }

    if (type === 'trending_creators' || type === 'trending_talents') {
      return (
        <FlatList
          data={trendingCreators}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={renderCreatorCard}
        />
      );
    }

    if (type === 'trending_livestreams') {
      return (
        <FlatList
          data={trendingLivestreams}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={renderLivestreamCard}
        />
      );
    }

    // Default: render video grid
    if (videos.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={handleVideoPress}
            width={cardWidth}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {renderContent()}
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
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    padding: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Club card styles
  clubCard: {
    width: (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clubImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  clubMembers: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  // Creator card styles
  creatorCard: {
    width: (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  creatorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  creatorName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  creatorFollowers: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.sm,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  followButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  // Livestream card styles
  livestreamCard: {
    width: (screenWidth - spacing.screenPadding * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
  },
  livestreamImage: {
    width: '100%',
    height: 180,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  livestreamGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: spacing.borderRadius.md,
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
  viewerBadge: {
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
  livestreamTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  livestreamCreator: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});

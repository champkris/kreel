import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Video } from '../../types';
import { formatViews } from '../../data/seedData';

interface VideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
  width?: number;
  showTitle?: boolean;
  showStats?: boolean;
  showBadge?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultCardWidth = (screenWidth - 60) / 2; // 2 columns with padding

const getCategoryName = (tags: string[]): string => {
  const categoryMap: Record<string, string> = {
    'betrayal': 'Betrayal',
    'hidden identity': 'Hidden Identity',
    'romance': 'Romance',
    'drama': 'Drama',
    'thriller': 'Thriller',
    'action': 'Action',
    'fantasy': 'Fantasy',
    'sports': 'Sports',
    'office': 'Office Romance',
    'martial arts': 'Martial Arts',
    'werewolf': 'Werewolf',
    'revenge': 'Revenge',
  };
  
  for (const tag of tags) {
    if (categoryMap[tag]) {
      return categoryMap[tag];
    }
  }
  return 'Drama'; // default
};

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  width = defaultCardWidth,
  showTitle = true,
  showStats = true,
  showBadge = true,
}) => {
  const aspectRatio = 3 / 4; // Portrait aspect ratio like in screenshots
  const cardHeight = width / aspectRatio;

  const renderBadge = () => {
    if (video.tags.includes('exclusive')) {
      return (
        <View style={[styles.badge, styles.exclusiveBadge]}>
          <Text style={styles.badgeText}>Exclusive</Text>
        </View>
      );
    }
    if (video.tags.includes('new')) {
      return (
        <View style={[styles.badge, styles.newBadge]}>
          <Text style={styles.badgeText}>New</Text>
        </View>
      );
    }
    if (video.tags.includes('hot') || video.views > 5000000) { // 5M+ views = Hot
      return (
        <View style={[styles.badge, styles.hotBadge]}>
          <Text style={styles.badgeText}>Hot</Text>
        </View>
      );
    }
    if (video.isFollowing) {
      return (
        <View style={[styles.badge, styles.followingBadge]}>
          <Text style={styles.badgeText}>Following</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(video)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        <Image
          source={{ uri: video.thumbnailUrl || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&h=600&fit=crop' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Badge */}
        {showBadge && renderBadge()}
        
        {/* Play icon and view count */}
        {showStats && (
          <View style={styles.statsContainer}>
            <View style={styles.playIcon}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
            <Text style={styles.viewCount}>{formatViews(video.views)}</Text>
          </View>
        )}
      </View>
      
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.category}>
            {getCategoryName(video.tags)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exclusiveBadge: {
    backgroundColor: '#6366F1',
  },
  newBadge: {
    backgroundColor: '#3B82F6',
  },
  hotBadge: {
    backgroundColor: '#EF4444',
  },
  followingBadge: {
    backgroundColor: '#6366F1',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    alignItems: 'center',
  },
  playIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  playIconText: {
    color: '#000',
    fontSize: 8,
    marginLeft: 1,
  },
  viewCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  category: {
    color: '#999',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default VideoCard;
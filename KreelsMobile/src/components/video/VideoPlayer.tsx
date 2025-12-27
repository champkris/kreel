import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Video as VideoType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface VideoPlayerProps {
  video: VideoType;
  onClose: () => void;
  onSwipeNext?: () => void;
  onSwipePrevious?: () => void;
  isActive?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  isActive = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [progress, setProgress] = useState(0);

  const likeScale = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Simulate video progress
  useEffect(() => {
    if (isActive && isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, isPlaying]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap - trigger like animation
      if (!isLiked) {
        setIsLiked(true);
        animateLike();
      }
      showHeartAnimation();
    }
    lastTap.current = now;
  };

  const handleSingleTap = () => {
    setTimeout(() => {
      const now = Date.now();
      if (now - lastTap.current >= 300) {
        setIsPlaying(!isPlaying);
        setShowControls(true);
        Animated.timing(controlsOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, 300);
  };

  const animateLike = () => {
    likeScale.setValue(0.8);
    Animated.spring(likeScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const showHeartAnimation = () => {
    heartOpacity.setValue(1);
    heartScale.setValue(0);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      animateLike();
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

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Background */}
      <TouchableWithoutFeedback
        onPress={() => {
          handleSingleTap();
          handleDoubleTap();
        }}
      >
        <View style={styles.videoContainer}>
          <Image
            source={{
              uri:
                video.thumbnailUrl ||
                'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800',
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          {/* Gradient overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent']}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bottomGradient}
          />

          {/* Pause indicator */}
          {!isPlaying && (
            <View style={styles.pauseOverlay}>
              <View style={styles.pauseIconContainer}>
                <Ionicons name="play" size={48} color="white" />
              </View>
            </View>
          )}

          {/* Double tap heart animation */}
          <Animated.View
            style={[
              styles.doubleTapHeart,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Ionicons name="heart" size={100} color={colors.primary} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Top Navigation */}
      <Animated.View style={[styles.topNav, { opacity: controlsOpacity }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <BlurView intensity={30} tint="dark" style={styles.blurButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topButton}>
            <BlurView intensity={30} tint="dark" style={styles.blurButton}>
              <Ionicons name="search" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Right Side Actions */}
      <Animated.View style={[styles.rightActions, { opacity: controlsOpacity }]}>
        {/* Creator Avatar */}
        <View style={styles.creatorAvatarContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.creatorAvatar}
          >
            <Text style={styles.creatorInitial}>
              {video.user?.username?.[0]?.toUpperCase() || 'K'}
            </Text>
          </LinearGradient>
          <View style={styles.followBadge}>
            <Ionicons name="add" size={12} color="white" />
          </View>
        </View>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: isLiked ? likeScale : 1 }] }}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? colors.primary : 'white'}
            />
          </Animated.View>
          <Text style={styles.actionText}>{formatNumber(video.likes || 48200)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="white" />
          <Text style={styles.actionText}>{formatNumber(1284)}</Text>
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={isBookmarked ? colors.primary : 'white'}
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={28} color="white" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {/* More Options */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Content */}
      <Animated.View style={[styles.bottomContent, { opacity: controlsOpacity }]}>
        {/* Creator Info */}
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>
            @{video.user?.username || 'kreels_official'}
          </Text>
          <View style={styles.followButton}>
            <Text style={styles.followText}>Follow</Text>
          </View>
        </View>

        {/* Video Title & Description */}
        <TouchableOpacity
          onPress={() => setShowFullDescription(!showFullDescription)}
          activeOpacity={0.9}
        >
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text
            style={styles.videoDescription}
            numberOfLines={showFullDescription ? undefined : 2}
          >
            {video.description}
            {!showFullDescription && (video.description?.length || 0) > 80 && (
              <Text style={styles.moreText}> ...more</Text>
            )}
          </Text>
        </TouchableOpacity>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tagText}>#drama</Text>
          <Text style={styles.tagText}>#romance</Text>
          <Text style={styles.tagText}>#kreels</Text>
        </View>

        {/* Music/Audio */}
        <View style={styles.musicContainer}>
          <Ionicons name="musical-notes" size={14} color="white" />
          <Text style={styles.musicText} numberOfLines={1}>
            Original Sound - {video.user?.username || 'kreels_official'}
          </Text>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomAction}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.downloadButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="download-outline" size={18} color="black" />
            <Text style={styles.downloadText}>Download</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.episodeButton}>
          <Ionicons name="list" size={18} color="white" />
          <Text style={styles.episodeText}>EP.1 / 58</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.qualityButton}>
          <Text style={styles.qualityText}>HD</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
  },
  topNav: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 180,
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },
  creatorAvatarContainer: {
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  creatorInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 80,
    zIndex: 10,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  creatorName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  followText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
  },
  videoTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  moreText: {
    color: 'rgba(255,255,255,0.6)',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  musicText: {
    color: 'white',
    fontSize: 12,
    maxWidth: 200,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  bottomAction: {},
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  downloadText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  episodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  episodeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  qualityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qualityText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default VideoPlayer;

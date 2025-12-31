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
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
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
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLandscapeVideo, setIsLandscapeVideo] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

  const likeScale = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  // Listen for dimension changes (orientation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  // Handle orientation when video type is detected
  useEffect(() => {
    if (isLandscapeVideo && isActive) {
      rotateToLandscape();
    }
    return () => {
      // Restore portrait on unmount
      restoreOrientation();
    };
  }, [isLandscapeVideo, isActive]);

  const rotateToLandscape = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsLandscapeMode(true);
    } catch (error) {
      console.log('Orientation lock error:', error);
    }
  };

  const restoreOrientation = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsLandscapeMode(false);
    } catch (error) {
      console.log('Orientation restore error:', error);
    }
  };

  const handleClose = async () => {
    await restoreOrientation();
    onClose();
  };

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  // Handle playback status update
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);

    if (status.durationMillis) {
      setDuration(status.durationMillis);
      setProgress((status.positionMillis / status.durationMillis) * 100);
    }

    // Detect video orientation from naturalSize
    const anyStatus = status as any;
    if (anyStatus.naturalSize && !isLandscapeVideo) {
      const { width, height } = anyStatus.naturalSize;
      const isLandscape = width > height;
      if (isLandscape) {
        setIsLandscapeVideo(true);
      }
    }
  };

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
        if (showControls) {
          // Hide controls
          Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowControls(false));
        } else {
          // Show controls
          setShowControls(true);
          Animated.timing(controlsOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    }, 300);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
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

  // Get video URL - use actual video or fallback to sample
  const videoUrl = video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <View style={[styles.container, isLandscapeMode && styles.landscapeContainer]}>
      <StatusBar hidden />

      {/* Video Player */}
      <TouchableWithoutFeedback
        onPress={() => {
          handleSingleTap();
          handleDoubleTap();
        }}
      >
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            posterSource={{ uri: video.thumbnailUrl || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800' }}
            usePoster={true}
            posterStyle={styles.poster}
            style={[
              styles.video,
              isLandscapeMode ? styles.landscapeVideo : styles.portraitVideo,
            ]}
            resizeMode={isLandscapeMode ? ResizeMode.CONTAIN : ResizeMode.COVER}
            shouldPlay={isActive && isPlaying}
            isLooping={true}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
            <TouchableOpacity style={styles.pauseOverlay} onPress={togglePlayPause}>
              <View style={styles.pauseIconContainer}>
                <Ionicons name="play" size={48} color="white" />
              </View>
            </TouchableOpacity>
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
      {showControls && (
        <Animated.View style={[styles.topNav, { opacity: controlsOpacity }]}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.blurButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>

          {/* Landscape indicator */}
          {isLandscapeVideo && (
            <View style={styles.landscapeBadge}>
              <Ionicons name="phone-landscape" size={14} color="white" />
              <Text style={styles.landscapeBadgeText}>HD</Text>
            </View>
          )}

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.topButton}>
              <BlurView intensity={30} tint="dark" style={styles.blurButton}>
                <Ionicons name="search" size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Right Side Actions - Only show in portrait mode */}
      {showControls && !isLandscapeMode && (
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
      )}

      {/* Bottom Content - Only show in portrait mode */}
      {showControls && !isLandscapeMode && (
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
      )}

      {/* Landscape Mode Controls */}
      {showControls && isLandscapeMode && (
        <Animated.View style={[styles.landscapeControls, { opacity: controlsOpacity }]}>
          <View style={styles.landscapeBottom}>
            <Text style={styles.landscapeTitle} numberOfLines={1}>{video.title}</Text>
            <View style={styles.landscapeActions}>
              <TouchableOpacity style={styles.landscapeAction} onPress={handleLikePress}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? colors.primary : 'white'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.landscapeAction}>
                <Ionicons name="chatbubble-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.landscapeAction}>
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.landscapeAction} onPress={restoreOrientation}>
                <Ionicons name="contract-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Progress Bar */}
      <View style={[styles.progressContainer, isLandscapeMode && styles.landscapeProgress]}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Bottom Action Bar - Only in portrait */}
      {!isLandscapeMode && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  landscapeContainer: {
    flexDirection: 'row',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  portraitVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  landscapeVideo: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    alignItems: 'center',
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
  landscapeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  landscapeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  landscapeControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  landscapeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  landscapeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  landscapeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  landscapeAction: {
    padding: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  landscapeProgress: {
    bottom: 60,
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

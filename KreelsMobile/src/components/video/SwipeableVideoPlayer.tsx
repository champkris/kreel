import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  FlatList,
  Animated,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Video as VideoType } from '../../types';
import { colors } from '../../theme/colors';

interface SwipeableVideoPlayerProps {
  videos: VideoType[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Free sample videos for demo
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

interface VideoItemProps {
  video: VideoType;
  isActive: boolean;
  index: number;
  onClose: () => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, isActive, index, onClose }) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');

  const likeScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  const videoUrl = SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length];

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      if (status.durationMillis) {
        setDuration(status.durationMillis);
        setProgress((status.positionMillis / status.durationMillis) * 100);
      }
    }
  }, []);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
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
      if (Date.now() - lastTap.current >= 300) {
        togglePlayPause();
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
      setIsPlaying(!isPlaying);
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.videoItemContainer}>
      <TouchableWithoutFeedback
        onPress={() => {
          handleSingleTap();
          handleDoubleTap();
        }}
      >
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isActive}
            isMuted={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />

          {/* Gradient overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent']}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.85)']}
            style={styles.bottomGradient}
          />

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* Pause indicator */}
          {!isPlaying && !isLoading && (
            <View style={styles.pauseOverlay}>
              <View style={styles.pauseIconContainer}>
                <Ionicons name="play" size={50} color="white" />
              </View>
            </View>
          )}

          {/* Double tap heart */}
          <Animated.View
            style={[
              styles.doubleTapHeart,
              { opacity: heartOpacity, transform: [{ scale: heartScale }] },
            ]}
          >
            <Ionicons name="heart" size={100} color={colors.primary} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <BlurView intensity={40} tint="dark" style={styles.blurButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={styles.episodeLabel}>EP.{index + 1}</Text>
        </View>

        <TouchableOpacity style={styles.backButton}>
          <BlurView intensity={40} tint="dark" style={styles.blurButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
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
            <Ionicons name="add" size={10} color="white" />
          </View>
        </View>

        {/* Like */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setIsLiked(!isLiked);
            if (!isLiked) animateLike();
          }}
        >
          <Animated.View style={{ transform: [{ scale: isLiked ? likeScale : 1 }] }}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? colors.primary : 'white'}
            />
          </Animated.View>
          <Text style={styles.actionText}>{formatNumber(video.likes || 48200)}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
          <Text style={styles.actionText}>{formatNumber(1284)}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={isBookmarked ? colors.primary : 'white'}
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={26} color="white" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>
            @{video.user?.username || 'kreels_official'}
          </Text>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.videoTitle} numberOfLines={1}>
          {video.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {video.description}
        </Text>

        <View style={styles.tagsRow}>
          <Text style={styles.tag}>#drama</Text>
          <Text style={styles.tag}>#romance</Text>
          <Text style={styles.tag}>#kreels</Text>
        </View>

        <View style={styles.musicRow}>
          <Ionicons name="musical-notes" size={12} color="white" />
          <Text style={styles.musicText}>Original Sound - kreels_official</Text>
          <View style={styles.musicDisc}>
            <Ionicons name="disc" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <View style={styles.progressDot} />
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.downloadBtn}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.downloadGradient}
          >
            <Ionicons name="download-outline" size={16} color="black" />
            <Text style={styles.downloadBtnText}>Download</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.episodeBtn}>
          <Ionicons name="list" size={16} color="white" />
          <Text style={styles.episodeBtnText}>Episodes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.qualityBtn}
          onPress={() => setShowQualityModal(true)}
        >
          <Text style={styles.qualityBtnText}>{selectedQuality}</Text>
          <Ionicons name="chevron-down" size={12} color="white" />
        </TouchableOpacity>
      </View>

      {/* Quality Modal */}
      <Modal
        visible={showQualityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQualityModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowQualityModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Video Quality</Text>
                  <TouchableOpacity onPress={() => setShowQualityModal(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                {['Auto', '1080p', '720p', '480p', '360p'].map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityOption,
                      selectedQuality === quality && styles.qualityOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedQuality(quality);
                      setShowQualityModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.qualityOptionText,
                        selectedQuality === quality && styles.qualityOptionTextSelected,
                      ]}
                    >
                      {quality}
                    </Text>
                    {selectedQuality === quality && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const SwipeableVideoPlayer: React.FC<SwipeableVideoPlayerProps> = ({
  videos,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: VideoType; index: number }) => (
      <VideoItem
        video={item}
        isActive={index === currentIndex}
        index={index}
        onClose={onClose}
      />
    ),
    [currentIndex, onClose]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex}
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* Vertical indicator */}
      <View style={styles.verticalIndicator}>
        {videos.slice(0, 5).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              currentIndex === index && styles.indicatorDotActive,
            ]}
          />
        ))}
        {videos.length > 5 && <Text style={styles.moreIndicator}>+{videos.length - 5}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoItemContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
  },
  videoWrapper: {
    flex: 1,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    height: 450,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  topCenter: {},
  episodeLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 200,
    alignItems: 'center',
    gap: 18,
    zIndex: 10,
  },
  creatorAvatarContainer: {
    marginBottom: 6,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  creatorInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 70,
    zIndex: 10,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  creatorName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  followBtnText: {
    color: 'black',
    fontSize: 11,
    fontWeight: '700',
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  musicText: {
    color: 'white',
    fontSize: 11,
    flex: 1,
  },
  musicDisc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  progressDot: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
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
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  downloadBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  downloadBtnText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
  },
  episodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  episodeBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  qualityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  verticalIndicator: {
    position: 'absolute',
    right: 6,
    top: '45%',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorDotActive: {
    height: 16,
    backgroundColor: colors.primary,
  },
  moreIndicator: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  qualityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  qualityOptionSelected: {
    backgroundColor: 'rgba(255,199,0,0.15)',
  },
  qualityOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  qualityOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SwipeableVideoPlayer;

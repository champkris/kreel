import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type VideoOrientation = 'portrait' | 'landscape' | 'auto';

interface FullScreenVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  orientation?: VideoOrientation; // 'portrait' | 'landscape' | 'auto'
  visible: boolean;
  onClose: () => void;
  autoPlay?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

export default function FullScreenVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  orientation = 'auto',
  visible,
  onClose,
  autoPlay = true,
  onPlaybackStatusUpdate,
}: FullScreenVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [detectedOrientation, setDetectedOrientation] = useState<VideoOrientation>('landscape');
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle orientation on mount/unmount
  useEffect(() => {
    if (visible) {
      setupOrientation();
    }
    return () => {
      resetOrientation();
    };
  }, [visible, orientation, detectedOrientation]);

  // Update dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  const setupOrientation = async () => {
    try {
      const targetOrientation = orientation === 'auto' ? detectedOrientation : orientation;

      if (targetOrientation === 'portrait') {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      }
    } catch (error) {
      console.log('Orientation lock error:', error);
    }
  };

  const resetOrientation = async () => {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (error) {
      console.log('Orientation unlock error:', error);
    }
  };

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      clearControlsTimeout();
      controlsTimeout.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }
    return () => clearControlsTimeout();
  }, [showControls, isPlaying]);

  const clearControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const showControlsAnimated = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleTap = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsAnimated();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setIsPlaying(status.isPlaying);

    if (!isSeeking) {
      setPosition(status.positionMillis);
    }

    if (status.durationMillis) {
      setDuration(status.durationMillis);
    }

    // Detect video orientation from naturalSize
    if (status.isLoaded && orientation === 'auto') {
      const anyStatus = status as any;
      if (anyStatus.naturalSize) {
        const { width, height } = anyStatus.naturalSize;
        const isPortrait = height > width;
        const newOrientation = isPortrait ? 'portrait' : 'landscape';
        if (newOrientation !== detectedOrientation) {
          setDetectedOrientation(newOrientation);
        }
      }
    }

    onPlaybackStatusUpdate?.(status);
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
    setIsSeeking(false);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    clearControlsTimeout();
  };

  const handleClose = async () => {
    try {
      await videoRef.current?.pauseAsync();
      await resetOrientation();
    } catch (error) {
      console.log('Close error:', error);
    }
    onClose();
  };

  const handleSkipBack = async () => {
    if (videoRef.current) {
      const newPosition = Math.max(0, position - 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const handleSkipForward = async () => {
    if (videoRef.current) {
      const newPosition = Math.min(duration, position + 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentOrientation = orientation === 'auto' ? detectedOrientation : orientation;
  const isPortraitVideo = currentOrientation === 'portrait';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <StatusBar hidden />

        <TouchableWithoutFeedback onPress={handleTap}>
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
              usePoster={!!thumbnailUrl}
              posterStyle={styles.poster}
              style={[
                styles.video,
                isPortraitVideo ? styles.portraitVideo : styles.landscapeVideo,
              ]}
              resizeMode={isPortraitVideo ? ResizeMode.CONTAIN : ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              isLooping={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {/* Controls Overlay */}
            {showControls && (
              <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
                {/* Top Gradient */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.7)', 'transparent']}
                  style={styles.topGradient}
                >
                  <View style={styles.topControls}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                      <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                    {title && (
                      <Text style={styles.title} numberOfLines={1}>
                        {title}
                      </Text>
                    )}
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* Center Controls */}
                <View style={styles.centerControls}>
                  <TouchableOpacity onPress={handleSkipBack} style={styles.skipButton}>
                    <Ionicons name="play-back" size={32} color="white" />
                    <Text style={styles.skipText}>10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={48}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleSkipForward} style={styles.skipButton}>
                    <Ionicons name="play-forward" size={32} color="white" />
                    <Text style={styles.skipText}>10</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.bottomGradient}
                >
                  <View style={styles.bottomControls}>
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <Text style={styles.timeText}>{formatTime(position)}</Text>
                      <Slider
                        style={styles.slider}
                        value={position}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor={colors.primary}
                        onSlidingStart={handleSeekStart}
                        onSlidingComplete={handleSeek}
                      />
                      <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>

                    {/* Bottom Actions */}
                    <View style={styles.bottomActions}>
                      <TouchableOpacity style={styles.bottomAction}>
                        <Ionicons name="volume-high" size={24} color="white" />
                      </TouchableOpacity>

                      <View style={styles.bottomRight}>
                        <TouchableOpacity style={styles.bottomAction}>
                          <Ionicons name="settings-outline" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bottomAction}>
                          <Ionicons
                            name={isPortraitVideo ? 'phone-portrait' : 'phone-landscape'}
                            size={22}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    backgroundColor: 'black',
  },
  landscapeVideo: {
    width: '100%',
    height: '100%',
  },
  portraitVideo: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: 'white',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  skipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 8,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: spacing.xl,
  },
  bottomControls: {},
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: spacing.sm,
  },
  timeText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    minWidth: 45,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomAction: {
    padding: spacing.sm,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});

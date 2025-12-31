import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { VerifiedBadge, BadgeRow, RankBadge } from '../components/common';
import type { BadgeData, RankData } from '../components/common';
import { videosAPI, usersAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import FullScreenVideoPlayer, { VideoOrientation } from '../components/video/FullScreenVideoPlayer';

const { width: screenWidth } = Dimensions.get('window');

interface VideoDetailParams {
  id: string;
  title?: string;
  thumbnail?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    verified?: boolean;
  };
  likes: number;
  isLiked: boolean;
}

interface VideoData {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  orientation?: VideoOrientation; // 'portrait' | 'landscape' | 'auto'
  viewCount: number;
  likeCount: number;
  commentCount: number;
  accessType: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    badges: BadgeData[];
    currentRank?: RankData;
    followersCount: number;
    isFollowing: boolean;
  };
}

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ VideoDetail: VideoDetailParams }, 'VideoDetail'>>();
  const { id, title: paramTitle, thumbnail: paramThumbnail } = route.params;
  const { user, isAuthenticated } = useAuthStore();

  const [video, setVideo] = useState<VideoData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
    fetchComments();
  }, [id]);

  const fetchVideoDetails = async () => {
    try {
      const response = await videosAPI.getVideo(id);
      if (response.success) {
        setVideo(response.data);
        setIsLiked(response.data.isLiked || false);
        setLikeCount(response.data.likeCount || 0);
        setIsFollowing(response.data.creator?.isFollowing || false);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await videosAPI.getComments(id);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Show login prompt
      return;
    }
    try {
      const response = await videosAPI.likeVideo(id);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleFollow = async () => {
    if (!video?.creator || !isAuthenticated) return;
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(video.creator.id);
        setIsFollowing(false);
      } else {
        await usersAPI.followUser(video.creator.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    try {
      const response = await videosAPI.addComment(id, newComment);
      if (response.success) {
        setComments([response.data, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleCreatorPress = () => {
    if (video?.creator) {
      navigation.navigate('Channel' as never, {
        id: video.creator.id,
        name: video.creator.displayName,
        avatar: video.creator.avatar,
      } as never);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity style={styles.commentAvatar}>
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatarPlaceholder}
          >
            <Text style={styles.avatarInitial}>
              {item.user.displayName?.[0] || 'U'}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.user.displayName}</Text>
          {item.user.verified && <VerifiedBadge size={12} style={{ marginLeft: 4 }} />}
          <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={item.isLiked ? colors.error : colors.textMuted}
            />
            <Text style={styles.commentActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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

  const hasOfficialBadge = video?.creator?.badges?.some(b => b.type === 'OFFICIAL');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Video</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Video Thumbnail */}
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: video?.thumbnail || paramThumbnail || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=450&fit=crop' }}
              style={styles.videoThumbnail}
            />
            <View style={styles.playOverlay}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => setShowVideoPlayer(true)}
              >
                <Ionicons name="play" size={40} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {video?.accessType !== 'FREE' && (
              <View style={styles.accessBadge}>
                <Ionicons
                  name={video?.accessType === 'LOCKED' ? 'lock-closed' : 'diamond'}
                  size={14}
                  color={colors.textPrimary}
                />
                <Text style={styles.accessText}>
                  {video?.accessType === 'LOCKED' ? 'Locked' : 'Premium'}
                </Text>
              </View>
            )}
          </View>

          {/* Video Info */}
          <View style={styles.infoSection}>
            <Text style={styles.videoTitle}>{video?.title || paramTitle}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>{formatNumber(video?.viewCount || 0)} views</Text>
              <Text style={styles.statDot}>•</Text>
              <Text style={styles.statText}>{formatDate(video?.createdAt || new Date().toISOString())}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? colors.error : colors.textPrimary}
              />
              <Text style={[styles.actionText, isLiked && { color: colors.error }]}>
                {formatNumber(likeCount)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.actionText}>{formatNumber(video?.commentCount || comments.length)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Creator Info */}
          {video?.creator && (
            <TouchableOpacity style={styles.creatorSection} onPress={handleCreatorPress}>
              <View style={styles.creatorAvatar}>
                {video.creator.avatar ? (
                  <Image source={{ uri: video.creator.avatar }} style={styles.creatorImage} />
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.creatorPlaceholder}
                  >
                    <Text style={styles.creatorInitial}>
                      {video.creator.displayName?.[0] || 'U'}
                    </Text>
                  </LinearGradient>
                )}
                {video.creator.currentRank && (
                  <View style={styles.rankOverlay}>
                    <RankBadge rank={video.creator.currentRank} size="small" />
                  </View>
                )}
              </View>
              <View style={styles.creatorInfo}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>{video.creator.displayName}</Text>
                  {hasOfficialBadge && <VerifiedBadge size={16} style={{ marginLeft: 4 }} />}
                </View>
                <Text style={styles.creatorFollowers}>
                  {formatNumber(video.creator.followersCount)} followers
                </Text>
                {video.creator.badges && video.creator.badges.length > 0 && (
                  <View style={styles.badgesRow}>
                    <BadgeRow badges={video.creator.badges} maxDisplay={4} size="small" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollow}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Description */}
          {video?.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{video.description}</Text>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              Comments ({comments.length})
            </Text>

            {commentsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.xl }} />
            ) : comments.length > 0 ? (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderComment}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handlePostComment}
              disabled={!newComment.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={newComment.trim() ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Fullscreen Video Player */}
      <FullScreenVideoPlayer
        videoUrl={video?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        thumbnailUrl={video?.thumbnail || paramThumbnail}
        title={video?.title || paramTitle}
        orientation={video?.orientation || 'auto'}
        visible={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        autoPlay={true}
      />
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
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerAction: {
    padding: spacing.xs,
  },
  videoContainer: {
    width: screenWidth,
    height: screenWidth * 9 / 16,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    gap: spacing.xs,
  },
  accessText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  infoSection: {
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  videoTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  statDot: {
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  creatorAvatar: {
    position: 'relative',
  },
  creatorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  creatorPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorInitial: {
    color: colors.background,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  rankOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  creatorFollowers: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  badgesRow: {
    marginTop: spacing.xs,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.buttonBorderRadius,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  followingText: {
    color: colors.textPrimary,
  },
  descriptionSection: {
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  commentsSection: {
    padding: spacing.screenPadding,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  commentContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  commentTime: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.sm,
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentActionText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  emptyComments: {
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
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  commentInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

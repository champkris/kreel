import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { VerifiedBadge, BadgeRow } from '../components/common';
import type { BadgeData } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');

interface SeriesDetailParams {
  id: string;
  title?: string;
  thumbnail?: string;
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration: number;
  thumbnail?: string;
  accessType: 'FREE' | 'LOCKED' | 'PAID';
  price?: number;
}

interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

interface SeriesData {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  year: number;
  rating: string;
  totalSeasons: number;
  totalEpisodes: number;
  freeEpisodeCount: number;
  genres: string[];
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
    verified: boolean;
    badges?: BadgeData[];
  };
  seasons: Season[];
}

// Mock series data for demo
const mockSeriesData: SeriesData = {
  id: '1',
  title: 'The Rising Star',
  description: 'Follow the journey of a small-town girl who dreams of becoming a K-pop idol. Through hardship, friendship, and determination, she navigates the competitive entertainment industry.',
  thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
  year: 2025,
  rating: '16+',
  totalSeasons: 2,
  totalEpisodes: 20,
  freeEpisodeCount: 3,
  genres: ['Drama', 'Romance', 'Music'],
  creator: {
    id: '1',
    displayName: 'Star Entertainment',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    verified: true,
    badges: [
      { id: '1', name: 'Official', type: 'OFFICIAL', icon: '✓' },
      { id: '2', name: 'Top Creator', type: 'TOP_CONTRIBUTOR', icon: '⭐' },
    ],
  },
  seasons: [
    {
      id: 's1',
      seasonNumber: 1,
      title: 'Season 1',
      episodes: [
        { id: 'e1', episodeNumber: 1, title: 'The Audition', description: 'Ji-yeon takes her first step towards her dream by attending a major audition.', duration: 45, accessType: 'FREE', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=170&fit=crop' },
        { id: 'e2', episodeNumber: 2, title: 'Training Days', description: 'The grueling training begins as Ji-yeon struggles to keep up with her peers.', duration: 42, accessType: 'FREE', thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=170&fit=crop' },
        { id: 'e3', episodeNumber: 3, title: 'First Performance', description: 'Ji-yeon faces her first public performance with unexpected results.', duration: 48, accessType: 'FREE', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=170&fit=crop' },
        { id: 'e4', episodeNumber: 4, title: 'Rivalry', description: 'A fierce rival emerges, threatening Ji-yeon\'s position in the group.', duration: 44, accessType: 'LOCKED', thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=170&fit=crop' },
        { id: 'e5', episodeNumber: 5, title: 'The Scandal', description: 'A media scandal puts the entire group\'s future at risk.', duration: 46, accessType: 'LOCKED', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=170&fit=crop' },
        { id: 'e6', episodeNumber: 6, title: 'Comeback', description: 'Against all odds, the group prepares for their comeback stage.', duration: 50, accessType: 'PAID', price: 2.99, thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=170&fit=crop' },
      ],
    },
    {
      id: 's2',
      seasonNumber: 2,
      title: 'Season 2',
      episodes: [
        { id: 'e7', episodeNumber: 1, title: 'New Beginnings', description: 'A year later, Ji-yeon faces new challenges as a debuted idol.', duration: 45, accessType: 'LOCKED', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=170&fit=crop' },
        { id: 'e8', episodeNumber: 2, title: 'World Tour', description: 'The group embarks on their first international tour.', duration: 48, accessType: 'PAID', price: 2.99, thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=170&fit=crop' },
      ],
    },
  ],
};

type TabType = 'episodes' | 'moreLikeThis' | 'trailers';

export default function SeriesDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ SeriesDetail: SeriesDetailParams }, 'SeriesDetail'>>();
  const { id, title: paramTitle, thumbnail: paramThumbnail } = route.params;

  const [series, setSeries] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('episodes');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isInMyList, setIsInMyList] = useState(false);

  useEffect(() => {
    fetchSeriesDetails();
  }, [id]);

  const fetchSeriesDetails = async () => {
    // TODO: Replace with actual API call
    // const response = await seriesAPI.getSeries(id);
    setTimeout(() => {
      setSeries(mockSeriesData);
      setLoading(false);
    }, 500);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getAccessBadge = (accessType: 'FREE' | 'LOCKED' | 'PAID', price?: number) => {
    switch (accessType) {
      case 'FREE':
        return (
          <View style={[styles.accessBadge, styles.freeBadge]}>
            <Text style={styles.accessBadgeText}>FREE</Text>
          </View>
        );
      case 'LOCKED':
        return (
          <View style={[styles.accessBadge, styles.lockedBadge]}>
            <Ionicons name="lock-closed" size={10} color={colors.textPrimary} />
            <Text style={styles.accessBadgeText}>LOCKED</Text>
          </View>
        );
      case 'PAID':
        return (
          <View style={[styles.accessBadge, styles.paidBadge]}>
            <Ionicons name="diamond" size={10} color={colors.textPrimary} />
            <Text style={styles.accessBadgeText}>${price?.toFixed(2)}</Text>
          </View>
        );
    }
  };

  const handleEpisodePress = (episode: Episode) => {
    if (episode.accessType === 'FREE') {
      // Play episode
      console.log('Playing episode:', episode.title);
    } else if (episode.accessType === 'LOCKED') {
      // Show unlock prompt (subscribe or watch ads)
      console.log('Episode locked:', episode.title);
    } else {
      // Show purchase prompt
      console.log('Purchase episode:', episode.title, episode.price);
    }
  };

  const handleCreatorPress = () => {
    if (series?.creator) {
      navigation.navigate('Channel' as never, {
        id: series.creator.id,
        name: series.creator.displayName,
        avatar: series.creator.avatar,
      } as never);
    }
  };

  const currentSeason = series?.seasons.find(s => s.seasonNumber === selectedSeason);

  const renderEpisode = ({ item: episode }: { item: Episode }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => handleEpisodePress(episode)}
      activeOpacity={0.7}
    >
      <View style={styles.episodeThumbnailContainer}>
        <Image
          source={{ uri: episode.thumbnail || paramThumbnail }}
          style={styles.episodeThumbnail}
        />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color={colors.textPrimary} />
          </View>
        </View>
        {getAccessBadge(episode.accessType, episode.price)}
      </View>
      <View style={styles.episodeInfo}>
        <View style={styles.episodeHeader}>
          <Text style={styles.episodeTitle} numberOfLines={1}>
            {episode.episodeNumber}. {episode.title}
          </Text>
          <Text style={styles.episodeDuration}>{formatDuration(episode.duration)}</Text>
        </View>
        {episode.description && (
          <Text style={styles.episodeDescription} numberOfLines={2}>
            {episode.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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

  // Count episodes by type
  const freeCount = series?.seasons.flatMap(s => s.episodes).filter(e => e.accessType === 'FREE').length || 0;
  const lockedCount = series?.seasons.flatMap(s => s.episodes).filter(e => e.accessType === 'LOCKED').length || 0;
  const paidCount = series?.seasons.flatMap(s => s.episodes).filter(e => e.accessType === 'PAID').length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Video Preview */}
        <View style={styles.videoContainer}>
          <Image
            source={{ uri: series?.thumbnail || paramThumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop' }}
            style={styles.videoPreview}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.videoGradient}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.videoPlayOverlay}>
            <TouchableOpacity style={styles.bigPlayButton}>
              <Ionicons name="play" size={40} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.muteButton}>
            <Ionicons name="volume-mute" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Series Info */}
        <View style={styles.infoSection}>
          <Text style={styles.seriesTitle}>{series?.title || paramTitle}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{series?.year}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{series?.rating}</Text>
            </View>
            <Text style={styles.metaText}>{series?.totalSeasons} Seasons</Text>
          </View>

          {/* Episode Count Summary */}
          <View style={styles.episodeCountRow}>
            <View style={styles.episodeCountItem}>
              <View style={[styles.countBadge, styles.freeBadge]}>
                <Text style={styles.countText}>{freeCount}</Text>
              </View>
              <Text style={styles.countLabel}>Free</Text>
            </View>
            <View style={styles.episodeCountItem}>
              <View style={[styles.countBadge, styles.lockedBadge]}>
                <Text style={styles.countText}>{lockedCount}</Text>
              </View>
              <Text style={styles.countLabel}>Locked</Text>
            </View>
            <View style={styles.episodeCountItem}>
              <View style={[styles.countBadge, styles.paidBadge]}>
                <Text style={styles.countText}>{paidCount}</Text>
              </View>
              <Text style={styles.countLabel}>Premium</Text>
            </View>
          </View>

          {/* Play Button */}
          <TouchableOpacity style={styles.playFullButton}>
            <Ionicons name="play" size={24} color={colors.background} />
            <Text style={styles.playFullText}>Play</Text>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.description}>{series?.description}</Text>

          {/* Creator */}
          {series?.creator && (
            <TouchableOpacity style={styles.creatorRow} onPress={handleCreatorPress}>
              <Text style={styles.creatorLabel}>Creator: </Text>
              <Text style={styles.creatorName}>{series.creator.displayName}</Text>
              {series.creator.verified && (
                <VerifiedBadge size={14} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          )}

          {/* Genres */}
          <View style={styles.genresRow}>
            {series?.genres.map((genre, index) => (
              <React.Fragment key={genre}>
                <Text style={styles.genreText}>{genre}</Text>
                {index < series.genres.length - 1 && (
                  <Text style={styles.genreDot}>•</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsInMyList(!isInMyList)}
          >
            <Ionicons
              name={isInMyList ? 'checkmark' : 'add'}
              size={24}
              color={colors.textPrimary}
            />
            <Text style={styles.actionText}>My List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="thumbs-up-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.actionText}>Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'episodes' && styles.tabActive]}
            onPress={() => setActiveTab('episodes')}
          >
            <Text style={[styles.tabText, activeTab === 'episodes' && styles.tabTextActive]}>
              Episodes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'moreLikeThis' && styles.tabActive]}
            onPress={() => setActiveTab('moreLikeThis')}
          >
            <Text style={[styles.tabText, activeTab === 'moreLikeThis' && styles.tabTextActive]}>
              More Like This
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trailers' && styles.tabActive]}
            onPress={() => setActiveTab('trailers')}
          >
            <Text style={[styles.tabText, activeTab === 'trailers' && styles.tabTextActive]}>
              Trailers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'episodes' && (
          <View style={styles.episodesSection}>
            {/* Season Selector */}
            <View style={styles.seasonSelector}>
              <TouchableOpacity style={styles.seasonDropdown}>
                <Text style={styles.seasonText}>Season {selectedSeason}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Episodes List */}
            <FlatList
              data={currentSeason?.episodes || []}
              keyExtractor={(item) => item.id}
              renderItem={renderEpisode}
              scrollEnabled={false}
              contentContainerStyle={styles.episodesList}
            />
          </View>
        )}

        {activeTab === 'moreLikeThis' && (
          <View style={styles.emptyTab}>
            <Ionicons name="grid-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTabText}>Similar content coming soon</Text>
          </View>
        )}

        {activeTab === 'trailers' && (
          <View style={styles.emptyTab}>
            <Ionicons name="film-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTabText}>No trailers available</Text>
          </View>
        )}

        <View style={{ height: spacing['3xl'] }} />
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
  videoContainer: {
    width: screenWidth,
    height: screenWidth * 9 / 16,
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: spacing.screenPadding,
  },
  seriesTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  ratingBadge: {
    borderWidth: 1,
    borderColor: colors.textMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  episodeCountRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  episodeCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  countLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  playFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  playFullText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  creatorLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  creatorName: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  genresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  genreDot: {
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.error,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  episodesSection: {
    padding: spacing.screenPadding,
  },
  seasonSelector: {
    marginBottom: spacing.lg,
  },
  seasonDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  seasonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  episodesList: {
    gap: spacing.lg,
  },
  episodeItem: {
    gap: spacing.md,
  },
  episodeThumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  episodeThumbnail: {
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  accessBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  freeBadge: {
    backgroundColor: '#22c55e',
  },
  lockedBadge: {
    backgroundColor: '#f59e0b',
  },
  paidBadge: {
    backgroundColor: '#8b5cf6',
  },
  accessBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  episodeInfo: {
    gap: spacing.xs,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  episodeDuration: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  episodeDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.md,
  },
});

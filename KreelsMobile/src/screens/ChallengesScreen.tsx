import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { challengesAPI } from '../services/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  submissionEnd: string;
  votingEnd?: string;
  rewardAmount: number;
  entryCount: number;
  voteCount: number;
  maxWinners: number;
  entryTier: string;
  entryFee?: number;
  prizePool?: number;
  thumbnail?: string;
  club: {
    id: string;
    name: string;
    avatar?: string;
  };
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  _count: {
    entries: number;
  };
}

// Mock data for demo
const mockChallenges: Challenge[] = [
  {
    id: 'ch1',
    title: 'Write the Next Episode Plot',
    description: 'Submit your idea for the Season 2 premiere of Rising Star. The winning entry will influence the actual storyline!',
    type: 'STORY_CO_CREATION',
    status: 'ACTIVE',
    submissionEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 500,
    entryCount: 47,
    voteCount: 0,
    maxWinners: 3,
    entryTier: 'FREE',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
    club: { id: 'club1', name: 'Rising Star Fan Club', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
    creator: { id: 'u1', displayName: 'Star Entertainment', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    _count: { entries: 47 },
  },
  {
    id: 'ch2',
    title: 'Character Design Challenge',
    description: 'Design a new supporting character for Corporate Wars Season 2. Include backstory and motivation.',
    type: 'CHARACTER_DEVELOPMENT',
    status: 'VOTING',
    submissionEnd: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 1000,
    entryCount: 89,
    voteCount: 342,
    maxWinners: 1,
    entryTier: 'COIN_ENTRY',
    entryFee: 50,
    prizePool: 4450,
    thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=300&fit=crop',
    club: { id: 'club2', name: 'Corporate Wars Official', avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
    creator: { id: 'u2', displayName: 'Starlight Studios', avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
    _count: { entries: 89 },
  },
  {
    id: 'ch3',
    title: 'Micro Story: First Date',
    description: 'Write a 30-word micro story about a memorable first date. Best entries will be featured!',
    type: 'THEME_MICRO',
    status: 'ACTIVE',
    submissionEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 100,
    entryCount: 156,
    voteCount: 0,
    maxWinners: 5,
    entryTier: 'FREE',
    thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
    club: { id: 'club3', name: 'Romance Writers Club', avatar: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100&h=100&fit=crop' },
    creator: { id: 'u3', displayName: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    _count: { entries: 156 },
  },
  {
    id: 'ch4',
    title: 'Alternate Ending Contest',
    description: 'What if the villain won? Write an alternate ending for Haunted High where the supernatural forces triumph.',
    type: 'ALTERNATE_ENDING',
    status: 'ACTIVE',
    submissionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 750,
    entryCount: 23,
    voteCount: 0,
    maxWinners: 2,
    entryTier: 'EXCLUSIVE',
    thumbnail: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=400&h=300&fit=crop',
    club: { id: 'club4', name: 'Haunted High Fans', avatar: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=100&h=100&fit=crop' },
    creator: { id: 'u4', displayName: 'Marcus Williams', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    _count: { entries: 23 },
  },
];

const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'VOTING', label: 'Voting' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  useEffect(() => {
    fetchChallenges();
  }, [activeFilter]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const status = activeFilter !== 'ALL' ? activeFilter : undefined;
      const response = await challengesAPI.getChallenges(1, 20, status);
      if (response.success && response.data?.items) {
        setChallenges(response.data.items);
      } else {
        // Use mock data if API fails
        setChallenges(mockChallenges.filter(c =>
          activeFilter === 'ALL' || c.status === activeFilter
        ));
      }
    } catch (error) {
      console.log('Using mock challenges data');
      setChallenges(mockChallenges.filter(c =>
        activeFilter === 'ALL' || c.status === activeFilter
      ));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  };

  const getTimeRemaining = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getChallengeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'STORY_CO_CREATION': 'Story',
      'CHARACTER_DEVELOPMENT': 'Character',
      'ALTERNATE_ENDING': 'Alt Ending',
      'WORLDBUILDING': 'World',
      'THEME_MICRO': 'Micro Story',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#22c55e';
      case 'VOTING': return '#f59e0b';
      case 'COMPLETED': return '#6b7280';
      default: return colors.textMuted;
    }
  };

  const getEntryTierBadge = (tier: string, fee?: number) => {
    switch (tier) {
      case 'FREE':
        return { label: 'FREE', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' };
      case 'COIN_ENTRY':
        return { label: `${fee} coins`, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' };
      case 'EXCLUSIVE':
        return { label: 'Members Only', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' };
      case 'CREATOR_TOKEN':
        return { label: 'Token Holders', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)' };
      default:
        return { label: tier, color: colors.textMuted, bg: 'rgba(128, 128, 128, 0.2)' };
    }
  };

  const handleChallengePress = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetail', { challengeId: challenge.id });
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const tierBadge = getEntryTierBadge(challenge.entryTier, challenge.entryFee);
    const timeRemaining = challenge.status === 'VOTING' && challenge.votingEnd
      ? getTimeRemaining(challenge.votingEnd)
      : getTimeRemaining(challenge.submissionEnd);

    return (
      <TouchableOpacity
        key={challenge.id}
        style={styles.challengeCard}
        onPress={() => handleChallengePress(challenge)}
        activeOpacity={0.8}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: challenge.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop' }}
            style={styles.cardImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          />
          <View style={styles.cardBadges}>
            <View style={[styles.typeBadge]}>
              <Text style={styles.typeBadgeText}>{getChallengeTypeLabel(challenge.type)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(challenge.status) }]}>
              <Text style={styles.statusBadgeText}>{challenge.status}</Text>
            </View>
          </View>
          <View style={styles.tierBadgeContainer}>
            <View style={[styles.tierBadge, { backgroundColor: tierBadge.bg }]}>
              <Text style={[styles.tierBadgeText, { color: tierBadge.color }]}>{tierBadge.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.clubInfo}>
            <Image source={{ uri: challenge.club.avatar }} style={styles.clubAvatar} />
            <Text style={styles.clubName}>{challenge.club.name}</Text>
          </View>

          <Text style={styles.challengeTitle} numberOfLines={2}>{challenge.title}</Text>
          <Text style={styles.challengeDesc} numberOfLines={2}>{challenge.description}</Text>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{challenge._count?.entries || challenge.entryCount} entries</Text>
            </View>
            {challenge.status === 'VOTING' && (
              <View style={styles.statItem}>
                <Ionicons name="thumbs-up-outline" size={16} color={colors.textMuted} />
                <Text style={styles.statText}>{challenge.voteCount} votes</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{timeRemaining}</Text>
            </View>
          </View>

          <View style={styles.rewardSection}>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardLabel}>Reward</Text>
              <Text style={styles.rewardAmount}>
                {challenge.entryTier === 'COIN_ENTRY' && challenge.prizePool
                  ? `${challenge.prizePool} coins`
                  : `${challenge.rewardAmount} coins`
                }
              </Text>
            </View>
            <View style={styles.winnersInfo}>
              <Text style={styles.winnersLabel}>{challenge.maxWinners} winner{challenge.maxWinners > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const isWeb = Platform.OS === 'web';

  const ScrollContainer = isWeb
    ? ({ children, style, refreshControl }: any) => (
        <div style={{ height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      )
    : ScrollView;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Challenges List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollContainer
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.challengesList}>
            {challenges.length > 0 ? (
              challenges.map(renderChallengeCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No challenges found</Text>
                <Text style={styles.emptyText}>Check back later for new challenges!</Text>
              </View>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollContainer>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengesList: {
    padding: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardBadges: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  tierBadgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: spacing.md,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  clubAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.xs,
  },
  clubName: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  challengeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  challengeDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  rewardAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#f59e0b',
  },
  winnersInfo: {},
  winnersLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default ChallengesScreen;

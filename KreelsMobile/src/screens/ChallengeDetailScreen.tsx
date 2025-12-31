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
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { challengesAPI } from '../services/api';

type ChallengeDetailRouteProp = RouteProp<RootStackParamList, 'ChallengeDetail'>;

interface Entry {
  id: string;
  title?: string;
  content: string;
  voteCount: number;
  isFeatured: boolean;
  isWinner: boolean;
  winnerRank?: number;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatar?: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  submissionStart?: string;
  submissionEnd: string;
  votingEnd?: string;
  rewardAmount: number;
  entryCount: number;
  voteCount: number;
  maxWinners: number;
  wordLimit?: number;
  guidelines?: string;
  entryTier: string;
  entryFee?: number;
  prizePool?: number;
  thumbnail?: string;
  club: {
    id: string;
    name: string;
    avatar?: string;
    banner?: string;
  };
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  entries: Entry[];
  _count: {
    entries: number;
  };
}

// Mock data
const mockChallenge: Challenge = {
  id: 'ch1',
  title: 'Write the Next Episode Plot',
  description: 'Submit your idea for the Season 2 premiere of Rising Star. The winning entry will influence the actual storyline! Be creative and think about character development, plot twists, and emotional moments.',
  type: 'STORY_CO_CREATION',
  status: 'ACTIVE',
  submissionEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  rewardAmount: 500,
  entryCount: 47,
  voteCount: 0,
  maxWinners: 3,
  wordLimit: 500,
  guidelines: '1. Your story must continue from Season 1 finale\n2. Include at least 2 main characters\n3. No explicit content\n4. Original ideas only',
  entryTier: 'FREE',
  thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
  club: {
    id: 'club1',
    name: 'Rising Star Fan Club',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=200&fit=crop',
  },
  creator: {
    id: 'u1',
    displayName: 'Star Entertainment',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  entries: [
    {
      id: 'e1',
      title: 'The Comeback Tour',
      content: 'Ji-yeon returns from her hiatus with a shocking announcement - she\'s forming her own agency. But when her former rival shows up with a mysterious offer, she must choose between revenge and redemption...',
      voteCount: 89,
      isFeatured: true,
      isWinner: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: { id: 'u10', displayName: 'StoryMaster99', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
    },
    {
      id: 'e2',
      title: 'Lost in Seoul',
      content: 'After the concert incident, Ji-yeon wakes up in a hospital with no memory of the past year. As she pieces together what happened, she discovers a conspiracy that reaches the highest levels of the industry...',
      voteCount: 67,
      isFeatured: false,
      isWinner: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: { id: 'u11', displayName: 'KdramaFan', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
    },
    {
      id: 'e3',
      content: 'The opening scene shows Ji-yeon standing on a rooftop at dawn, looking at the city skyline. A voiceover reveals her inner turmoil - should she pursue solo stardom or stay loyal to her group?',
      voteCount: 45,
      isFeatured: false,
      isWinner: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: { id: 'u12', displayName: 'WriterKim', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    },
  ],
  _count: { entries: 47 },
};

const ChallengeDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ChallengeDetailRouteProp>();
  const { challengeId } = route.params;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'guidelines'>('entries');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await challengesAPI.getChallenge(challengeId);
      if (response.success && response.data) {
        setChallenge(response.data);
        setEntries(response.data.entries || []);
      } else {
        // Use mock data
        setChallenge(mockChallenge);
        setEntries(mockChallenge.entries);
      }
    } catch (error) {
      console.log('Using mock challenge data');
      setChallenge(mockChallenge);
      setEntries(mockChallenge.entries);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim()) {
      Alert.alert('Error', 'Please enter your submission content');
      return;
    }

    if (challenge?.wordLimit && getWordCount(submissionContent) > challenge.wordLimit) {
      Alert.alert('Error', `Your submission exceeds the ${challenge.wordLimit} word limit`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await challengesAPI.submitEntry(challengeId, {
        title: submissionTitle || undefined,
        content: submissionContent,
      });

      if (response.success) {
        Alert.alert('Success', 'Your entry has been submitted!');
        setShowSubmitModal(false);
        setSubmissionTitle('');
        setSubmissionContent('');
        fetchChallenge();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to submit entry');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to submit entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (entryId: string) => {
    if (challenge?.status !== 'VOTING') {
      Alert.alert('Info', 'Voting is not open yet');
      return;
    }

    try {
      if (votedEntries.has(entryId)) {
        await challengesAPI.removeVote(challengeId, entryId);
        setVotedEntries(prev => {
          const newSet = new Set(prev);
          newSet.delete(entryId);
          return newSet;
        });
        setEntries(prev => prev.map(e =>
          e.id === entryId ? { ...e, voteCount: e.voteCount - 1 } : e
        ));
      } else {
        await challengesAPI.voteForEntry(challengeId, entryId);
        setVotedEntries(prev => new Set(prev).add(entryId));
        setEntries(prev => prev.map(e =>
          e.id === entryId ? { ...e, voteCount: e.voteCount + 1 } : e
        ));
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to vote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#22c55e';
      case 'VOTING': return '#f59e0b';
      case 'COMPLETED': return '#6b7280';
      default: return colors.textMuted;
    }
  };

  const renderEntry = (entry: Entry, index: number) => {
    const hasVoted = votedEntries.has(entry.id);

    return (
      <View key={entry.id} style={styles.entryCard}>
        {entry.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {entry.isWinner && (
          <View style={[styles.featuredBadge, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
            <Ionicons name="trophy" size={12} color="#22c55e" />
            <Text style={[styles.featuredText, { color: '#22c55e' }]}>
              #{entry.winnerRank} Winner
            </Text>
          </View>
        )}

        <View style={styles.entryHeader}>
          <Image source={{ uri: entry.user.avatar }} style={styles.entryAvatar} />
          <View style={styles.entryUserInfo}>
            <Text style={styles.entryUserName}>{entry.user.displayName}</Text>
            <Text style={styles.entryDate}>
              {new Date(entry.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {challenge?.status === 'VOTING' && (
            <TouchableOpacity
              style={[styles.voteButton, hasVoted && styles.voteButtonActive]}
              onPress={() => handleVote(entry.id)}
            >
              <Ionicons
                name={hasVoted ? 'heart' : 'heart-outline'}
                size={20}
                color={hasVoted ? '#ef4444' : colors.textMuted}
              />
              <Text style={[styles.voteCount, hasVoted && styles.voteCountActive]}>
                {entry.voteCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {entry.title && (
          <Text style={styles.entryTitle}>{entry.title}</Text>
        )}
        <Text style={styles.entryContent}>{entry.content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isWeb = Platform.OS === 'web';
  const ScrollContainer = isWeb
    ? ({ children }: any) => (
        <div style={{ height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      )
    : ScrollView;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollContainer>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: challenge.thumbnail || challenge.club.banner }}
            style={styles.bannerImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.bannerGradient}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(challenge.status) }]}>
              <Text style={styles.statusText}>{challenge.status}</Text>
            </View>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
          </View>
        </View>

        {/* Challenge Info */}
        <View style={styles.infoSection}>
          <View style={styles.clubRow}>
            <Image source={{ uri: challenge.club.avatar }} style={styles.clubAvatar} />
            <View>
              <Text style={styles.clubName}>{challenge.club.name}</Text>
              <Text style={styles.creatorName}>by {challenge.creator.displayName}</Text>
            </View>
          </View>

          <Text style={styles.description}>{challenge.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{challenge._count?.entries || challenge.entryCount}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{challenge.maxWinners}</Text>
              <Text style={styles.statLabel}>Winners</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {challenge.entryTier === 'COIN_ENTRY' && challenge.prizePool
                  ? challenge.prizePool
                  : challenge.rewardAmount}
              </Text>
              <Text style={styles.statLabel}>Coins Prize</Text>
            </View>
          </View>

          {/* Time Remaining */}
          <View style={styles.timeBox}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.timeText}>
              {challenge.status === 'VOTING' && challenge.votingEnd
                ? `Voting: ${getTimeRemaining(challenge.votingEnd)}`
                : `Submissions: ${getTimeRemaining(challenge.submissionEnd)}`}
            </Text>
          </View>

          {/* Submit Button */}
          {challenge.status === 'ACTIVE' && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setShowSubmitModal(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Entry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
            onPress={() => setActiveTab('entries')}
          >
            <Text style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}>
              Entries ({entries.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'guidelines' && styles.tabActive]}
            onPress={() => setActiveTab('guidelines')}
          >
            <Text style={[styles.tabText, activeTab === 'guidelines' && styles.tabTextActive]}>
              Guidelines
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'entries' ? (
            entries.length > 0 ? (
              entries.map((entry, i) => renderEntry(entry, i))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
              </View>
            )
          ) : (
            <View style={styles.guidelinesSection}>
              {challenge.wordLimit && (
                <View style={styles.guidelineItem}>
                  <Ionicons name="text-outline" size={20} color={colors.primary} />
                  <Text style={styles.guidelineText}>
                    Word limit: {challenge.wordLimit} words
                  </Text>
                </View>
              )}
              {challenge.guidelines && (
                <View style={styles.guidelinesBox}>
                  <Text style={styles.guidelinesTitle}>Guidelines</Text>
                  <Text style={styles.guidelinesContent}>{challenge.guidelines}</Text>
                </View>
              )}
              <View style={styles.guidelineItem}>
                <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
                <Text style={styles.guidelineText}>
                  {challenge.maxWinners} winner{challenge.maxWinners > 1 ? 's' : ''} will receive{' '}
                  {Math.floor((challenge.prizePool || challenge.rewardAmount) / challenge.maxWinners)} coins each
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollContainer>

      {/* Submit Modal */}
      <Modal
        visible={showSubmitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Entry</Text>
              <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor={colors.textMuted}
              value={submissionTitle}
              onChangeText={setSubmissionTitle}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Write your entry..."
              placeholderTextColor={colors.textMuted}
              value={submissionContent}
              onChangeText={setSubmissionContent}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalFooter}>
              <Text style={styles.wordCount}>
                {getWordCount(submissionContent)}{challenge.wordLimit ? ` / ${challenge.wordLimit}` : ''} words
              </Text>
              <TouchableOpacity
                style={[styles.submitEntryButton, submitting && styles.submitEntryButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitEntryButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  errorText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  headerImage: {
    height: 220,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  headerContent: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  infoSection: {
    padding: spacing.md,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clubAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  clubName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  creatorName: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timeText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
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
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  tabContent: {
    padding: spacing.md,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
  },
  entryUserInfo: {
    flex: 1,
  },
  entryUserName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  entryDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  voteButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  voteCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  voteCountActive: {
    color: '#ef4444',
  },
  entryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  entryContent: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  guidelinesSection: {
    gap: spacing.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guidelineText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  guidelinesBox: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
  },
  guidelinesTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guidelinesContent: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  contentInput: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    minHeight: 200,
    marginBottom: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  submitEntryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
  },
  submitEntryButtonDisabled: {
    opacity: 0.6,
  },
  submitEntryButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ChallengeDetailScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Card } from '../components/common';
import { challengesAPI } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

export type ClubDetailParams = {
  ClubDetail: {
    id: string;
    name: string;
    members: string;
    image?: string;
  };
};

// Mock data for club posts
const clubPosts = [
  {
    id: '1',
    author: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    time: '2 hours ago',
    content: 'Just finished watching the latest episode! Who else is excited for the finale?',
    likes: 156,
    comments: 24,
  },
  {
    id: '2',
    author: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    time: '5 hours ago',
    content: 'My fan theory: I think the main character will...',
    likes: 89,
    comments: 45,
  },
];

const clubMembers = [
  { id: '1', name: 'Admin', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isAdmin: true },
  { id: '2', name: 'John', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: '3', name: 'Emma', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: '4', name: 'Alex', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

// Mock challenges data for demo
const mockChallenges = [
  {
    id: '1',
    title: 'Best Fan Theory',
    description: 'Share your wildest theory about what happens next!',
    status: 'ACTIVE',
    entryTier: 'FREE',
    rewardType: 'COINS',
    rewardAmount: 500,
    entriesCount: 24,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Character Artwork',
    description: 'Draw your favorite character in your own style',
    status: 'VOTING',
    entryTier: 'COIN_ENTRY',
    rewardType: 'COINS',
    rewardAmount: 1000,
    entriesCount: 45,
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ClubDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<ClubDetailParams, 'ClubDetail'>>();
  const { id, name, members, image } = route.params;

  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'challenges' | 'members' | 'about'>('posts');
  const [challenges, setChallenges] = useState<typeof mockChallenges>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  useEffect(() => {
    if (activeTab === 'challenges') {
      fetchChallenges();
    }
  }, [activeTab]);

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const response = await challengesAPI.getChallenges(1, 20, undefined, id);
      if (response.success && response.data?.length > 0) {
        // Transform API data to match expected shape
        setChallenges(response.data.map((c: any) => ({
          id: c.id,
          title: c.title || 'Untitled Challenge',
          description: c.description || '',
          status: c.status || 'ACTIVE',
          entryTier: c.entryTier || 'FREE',
          rewardType: c.rewardType || 'COINS',
          rewardAmount: c.rewardAmount || 0,
          entriesCount: c.entriesCount || 0,
          endDate: c.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })));
      } else {
        setChallenges(mockChallenges);
      }
    } catch (error) {
      console.log('Using mock challenges data');
      setChallenges(mockChallenges);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleJoin = () => {
    setIsJoined(!isJoined);
  };

  const handleChallengePress = (challengeId: string) => {
    navigation.navigate('ChallengeDetail', { challengeId });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const renderPost = ({ item }: { item: typeof clubPosts[0] }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{item.author}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderMember = ({ item }: { item: typeof clubMembers[0] }) => (
    <TouchableOpacity style={styles.memberItem}>
      <Image source={{ uri: item.image }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item.isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Club Banner */}
        <ImageBackground
          source={{ uri: image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=300&fit=crop' }}
          style={styles.banner}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.clubName}>{name}</Text>
            <Text style={styles.clubMembers}>{members} Members</Text>
          </View>
        </ImageBackground>

        {/* Club Info */}
        <View style={styles.infoSection}>
          <Text style={styles.clubDescription}>
            A community for fans to discuss, share theories, and connect with fellow enthusiasts.
          </Text>

          {/* Member Avatars */}
          <View style={styles.membersPreview}>
            {clubMembers.slice(0, 4).map((member, index) => (
              <Image
                key={member.id}
                source={{ uri: member.image }}
                style={[styles.previewAvatar, { marginLeft: index > 0 ? -12 : 0 }]}
              />
            ))}
            <Text style={styles.membersText}>+{members} members</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.joinButton, isJoined && styles.joinedButton]}
              onPress={handleJoin}
            >
              <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
                {isJoined ? 'Joined' : 'Join Club'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
              Challenges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.tabActive]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <FlatList
              data={clubPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
          {activeTab === 'challenges' && (
            loadingChallenges ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : challenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyStateText}>No challenges yet</Text>
                <Text style={styles.emptyStateSubtext}>Check back soon for exciting challenges!</Text>
              </View>
            ) : (
              <View style={styles.challengesList}>
                {challenges.map((challenge) => (
                  <TouchableOpacity
                    key={challenge.id}
                    style={styles.challengeCard}
                    onPress={() => handleChallengePress(challenge.id)}
                  >
                    <View style={styles.challengeHeader}>
                      <View style={[
                        styles.statusBadge,
                        challenge.status === 'ACTIVE' && styles.statusActive,
                        challenge.status === 'VOTING' && styles.statusVoting,
                      ]}>
                        <Text style={styles.statusText}>{challenge.status}</Text>
                      </View>
                      <View style={styles.tierBadge}>
                        <Ionicons
                          name={challenge.entryTier === 'FREE' ? 'star-outline' : 'star'}
                          size={12}
                          color={colors.primary}
                        />
                        <Text style={styles.tierText}>{(challenge.entryTier || 'FREE').replace('_', ' ')}</Text>
                      </View>
                    </View>

                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription} numberOfLines={2}>
                      {challenge.description}
                    </Text>

                    <View style={styles.challengeFooter}>
                      <View style={styles.challengeStat}>
                        <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.statText}>{challenge.entriesCount || 0} entries</Text>
                      </View>
                      <View style={styles.challengeStat}>
                        <Ionicons name="gift-outline" size={14} color={colors.primary} />
                        <Text style={[styles.statText, { color: colors.primary }]}>
                          {challenge.rewardAmount || 0} coins
                        </Text>
                      </View>
                      <Text style={styles.timeRemaining}>{getTimeRemaining(challenge.endDate || new Date().toISOString())}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}
          {activeTab === 'members' && (
            <FlatList
              data={clubMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
          {activeTab === 'about' && (
            <View style={styles.aboutSection}>
              <View style={styles.aboutItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                <Text style={styles.aboutText}>Created January 2024</Text>
              </View>
              <View style={styles.aboutItem}>
                <Ionicons name="globe-outline" size={20} color={colors.textMuted} />
                <Text style={styles.aboutText}>Public Club</Text>
              </View>
              <View style={styles.aboutItem}>
                <Ionicons name="people-outline" size={20} color={colors.textMuted} />
                <Text style={styles.aboutText}>{members} Members</Text>
              </View>
              <View style={styles.rulesSection}>
                <Text style={styles.rulesTitle}>Club Rules</Text>
                <Text style={styles.ruleText}>1. Be respectful to all members</Text>
                <Text style={styles.ruleText}>2. No spoilers without warning</Text>
                <Text style={styles.ruleText}>3. Stay on topic</Text>
                <Text style={styles.ruleText}>4. No spam or self-promotion</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  },
  moreButton: {
    padding: spacing.xs,
  },
  banner: {
    height: 180,
    justifyContent: 'flex-end',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    padding: spacing.screenPadding,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  clubMembers: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  infoSection: {
    padding: spacing.screenPadding,
  },
  clubDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  membersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.background,
  },
  membersText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  joinedButtonText: {
    color: colors.textPrimary,
  },
  inviteButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.screenPadding,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    padding: spacing.screenPadding,
  },
  postCard: {
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  postTime: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  postContent: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  adminBadge: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  aboutSection: {
    gap: spacing.lg,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  rulesSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
  },
  rulesTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  ruleText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
  // Challenges styles
  loadingContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  challengesList: {
    gap: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusVoting: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tierText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  challengeTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  timeRemaining: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginLeft: 'auto',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card, VerifiedBadge } from '../../components/common';
import { clubsAPI } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');
const clubCardWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md) / 2;

type TabType = 'feed' | 'allClubs' | 'challenges';

interface ClubData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isOfficial: boolean;
  memberCount: number;
  createdAt: string;
}

// Mock data with images
const feedPosts = [
  {
    id: '1',
    author: 'Sophie Lambert',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    time: '25 min ago',
    content: 'Behind the scenes of our latest project! The team has been working incredibly hard.',
    likes: 486,
    comments: 12,
    shares: 5,
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    author: 'Kathryn Murphy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    time: '1 hour ago',
    content: 'Which acting technique would you like to master next?',
    likes: 234,
    comments: 45,
    shares: 2,
    isPoll: true,
    pollOptions: [
      { id: '1', text: 'Meisner Technique', percentage: 65 },
      { id: '2', text: 'Method Acting', percentage: 35 },
    ],
  },
];

const myClubs = [
  { id: '1', name: 'Action Films', members: '5K', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=100&h=100&fit=crop' },
  { id: '2', name: 'Drama Club', members: '8K', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=100&h=100&fit=crop' },
  { id: '3', name: 'Comedy', members: '3K', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=100&h=100&fit=crop' },
  { id: '4', name: 'Romance', members: '12K', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop' },
];

const trendingClubs = [
  { id: '1', name: 'K-Drama Lovers', members: '120K', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=400&fit=crop' },
  { id: '2', name: 'Anime Club', members: '95K', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop' },
  { id: '3', name: 'Horror Fans', members: '67K', image: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=400&h=400&fit=crop' },
  { id: '4', name: 'Sci-Fi World', members: '82K', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop' },
];

const challenges = [
  {
    id: '1',
    title: 'Best Fan Theory',
    prize: '1 month premium',
    entries: 100,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=250&fit=crop',
  },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ClubsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await clubsAPI.getClubs();
      if (response.success) {
        setClubs(response.data);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMemberCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const handleClubPress = (club: { id: string; name: string; members: string; image?: string }) => {
    navigation.navigate('ClubDetail', {
      id: club.id,
      name: club.name,
      members: club.members,
      image: club.image,
    });
  };

  const handleCreateClub = () => {
    Alert.alert('Create Club', 'Create Club feature coming soon!');
  };

  const handleAuthorPress = (author: string) => {
    navigation.navigate('Channel', {
      id: author.replace(/\s/g, '_').toLowerCase(),
      name: author,
    });
  };

  const renderPostCard = ({ item }: { item: typeof feedPosts[0] }) => (
    <Card style={styles.postCard}>
      {/* Author header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.authorAvatar}
          onPress={() => handleAuthorPress(item.author)}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={StyleSheet.absoluteFill} />
          ) : (
            <>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.authorInitial}>{item.author[0]}</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => handleAuthorPress(item.author)}
        >
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post image */}
      {item.image && typeof item.image === 'string' && (
        <Image
          source={{ uri: item.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Poll */}
      {item.isPoll && item.pollOptions && (
        <View style={styles.pollContainer}>
          {item.pollOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.pollOption}>
              <View
                style={[
                  styles.pollBar,
                  { width: `${option.percentage}%` },
                ]}
              />
              <Text style={styles.pollText}>{option.text}</Text>
              <Text style={styles.pollPercentage}>{option.percentage}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{item.comments} comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="arrow-redo-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{item.shares} share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderFeed = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Post composer */}
      <Card style={styles.composerCard}>
        <View style={styles.composerRow}>
          <View style={styles.composerAvatar}>
            <Ionicons name="person" size={20} color={colors.textMuted} />
          </View>
          <TextInput
            style={styles.composerInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.composerActions}>
          <TouchableOpacity style={styles.composerButton}>
            <Ionicons name="image-outline" size={20} color={colors.primary} />
            <Text style={styles.composerButtonText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.composerButton}>
            <Ionicons name="videocam-outline" size={20} color={colors.primary} />
            <Text style={styles.composerButtonText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.composerButton}>
            <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
            <Text style={styles.composerButtonText}>Poll</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Posts */}
      <FlatList
        data={feedPosts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.feedList}
      />
    </ScrollView>
  );

  const renderAllClubs = () => {
    // Separate official and regular clubs
    const officialClubs = clubs.filter(c => c.isOfficial);
    const regularClubs = clubs.filter(c => !c.isOfficial);

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Clubs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.myClubsRow}>
              {/* Create new club */}
              <TouchableOpacity style={styles.createClubButton} onPress={handleCreateClub}>
                <Ionicons name="add" size={32} color={colors.textMuted} />
              </TouchableOpacity>
              {myClubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.myClubItem}
                  onPress={() => handleClubPress(club)}
                >
                  <View style={styles.myClubAvatar}>
                    {club.image ? (
                      <Image source={{ uri: club.image }} style={StyleSheet.absoluteFill} />
                    ) : (
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                  </View>
                  <Text style={styles.myClubName}>{club.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Official Clubs */}
        {officialClubs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Official Clubs</Text>
              <VerifiedBadge size={18} />
            </View>
            <View style={styles.clubsGrid}>
              {officialClubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.clubCard}
                  onPress={() => handleClubPress({ id: club.id, name: club.name, members: formatMemberCount(club.memberCount), image: club.image })}
                >
                  <View style={styles.clubImageContainer}>
                    <ImageBackground
                      source={{ uri: club.image || 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=400&fit=crop' }}
                      style={styles.clubImage}
                      imageStyle={{ borderRadius: spacing.borderRadius.md }}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={StyleSheet.absoluteFill}
                      />
                    </ImageBackground>
                    <View style={styles.officialBadge}>
                      <VerifiedBadge size={20} />
                    </View>
                  </View>
                  <View style={styles.clubNameRow}>
                    <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                  </View>
                  <Text style={styles.clubMembers}>{formatMemberCount(club.memberCount)} Members</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {loading ? 'Loading Clubs...' : 'All Clubs'}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />
          ) : (
            <View style={styles.clubsGrid}>
              {(regularClubs.length > 0 ? regularClubs : trendingClubs).map((club) => {
                const isApiClub = 'memberCount' in club;
                const members = isApiClub ? formatMemberCount((club as ClubData).memberCount) : (club as typeof trendingClubs[0]).members;
                const isOfficial = isApiClub && (club as ClubData).isOfficial;

                return (
                  <TouchableOpacity
                    key={club.id}
                    style={styles.clubCard}
                    onPress={() => handleClubPress({ id: club.id, name: club.name, members, image: club.image })}
                  >
                    <View style={styles.clubImageContainer}>
                      <ImageBackground
                        source={{ uri: club.image || 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=400&fit=crop' }}
                        style={styles.clubImage}
                        imageStyle={{ borderRadius: spacing.borderRadius.md }}
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.6)']}
                          style={StyleSheet.absoluteFill}
                        />
                      </ImageBackground>
                      {isOfficial && (
                        <View style={styles.officialBadge}>
                          <VerifiedBadge size={20} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubMembers}>{members} Members</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderChallenges = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Featured Challenge */}
      <Card style={styles.featuredChallenge}>
        <TouchableOpacity style={styles.challengeTag}>
          <Text style={styles.challengeTagText}>Meet the Cast (Virtual)</Text>
        </TouchableOpacity>
        <Text style={styles.challengeTitle}>Content League</Text>
        <Text style={styles.challengeDesc}>
          A cozy corner for all K-Drama lovers to share feels, spoilers (carefully!)
        </Text>
        <TouchableOpacity style={styles.enterButton}>
          <Text style={styles.enterButtonText}>Enter Now</Text>
        </TouchableOpacity>
      </Card>

      {/* Active Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {challenges.map((challenge) => (
          <Card key={challenge.id} style={styles.challengeCard}>
            <ImageBackground
              source={{ uri: challenge.image }}
              style={styles.challengeImage}
              imageStyle={{ borderRadius: spacing.borderRadius.md }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeCardTitle}>{challenge.title}</Text>
              <View style={styles.challengeMeta}>
                <Ionicons name="people" size={14} color={colors.textMuted} />
                <Text style={styles.challengeMetaText}>{challenge.entries} Entry</Text>
              </View>
              <TouchableOpacity style={styles.prizeBadge}>
                <Text style={styles.prizeText}>{challenge.prize}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clubs</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'allClubs' && styles.tabActive]}
          onPress={() => setActiveTab('allClubs')}
        >
          <Text style={[styles.tabText, activeTab === 'allClubs' && styles.tabTextActive]}>
            All Clubs
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'allClubs' && renderAllClubs()}
        {activeTab === 'challenges' && renderChallenges()}
      </View>
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  tab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  // Feed
  composerCard: {
    marginBottom: spacing.md,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  composerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  composerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  composerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  composerButtonText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  feedList: {
    paddingBottom: spacing['3xl'],
  },
  postCard: {
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  authorInitial: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
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
  postImage: {
    height: 200,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pollContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    overflow: 'hidden',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  pollText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
  },
  pollPercentage: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
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
  // All Clubs
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  myClubsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  createClubButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myClubItem: {
    alignItems: 'center',
  },
  myClubAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  myClubName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  clubsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  clubCard: {
    width: clubCardWidth,
  },
  clubImageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  clubImage: {
    width: clubCardWidth,
    height: clubCardWidth,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  officialBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 2,
  },
  clubNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  clubMembers: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // Challenges
  featuredChallenge: {
    marginBottom: spacing.lg,
  },
  challengeTag: {
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  challengeTagText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  challengeTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  challengeDesc: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  enterButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  enterButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  challengeCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  challengeImage: {
    width: 120,
    height: 100,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  challengeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  challengeCardTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  challengeMetaText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  prizeBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  prizeText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
});

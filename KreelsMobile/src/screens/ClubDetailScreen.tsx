import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Card } from '../components/common';

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

export default function ClubDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ClubDetailParams, 'ClubDetail'>>();
  const { id, name, members, image } = route.params;

  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');

  const handleJoin = () => {
    setIsJoined(!isJoined);
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
});

import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { ViewAllType } from '../ViewAllScreen';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

// Mock data with images
const newReleases = [
  { id: '1', title: 'The Last Kingdom', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop' },
  { id: '2', title: 'Dark Romance', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=600&fit=crop' },
  { id: '3', title: 'City Lights', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=600&fit=crop' },
  { id: '4', title: 'Eternal Love', image: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=600&fit=crop' },
];

const trendingClubs = [
  { id: '1', name: 'K-Drama Fans', members: '12K', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=200&h=200&fit=crop' },
  { id: '2', name: 'Action Movies', members: '8K', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=200&h=200&fit=crop' },
  { id: '3', name: 'Romance', members: '15K', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=200&fit=crop' },
  { id: '4', name: 'Thriller', members: '6K', image: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=200&h=200&fit=crop' },
];

const trendingCreators = [
  { id: '1', name: 'John Doe', followers: '50K', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '2', name: 'Jane Smith', followers: '120K', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: '3', name: 'Mike Johnson', followers: '80K', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: '4', name: 'Sarah Lee', followers: '200K', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
];

const trendingLivestreams = [
  { id: '1', title: 'Live Concert', creator: 'By Olivia', viewers: '5.1K', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=500&fit=crop' },
  { id: '2', title: 'Q&A Session', creator: 'By Mike', viewers: '3.2K', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=500&fit=crop' },
  { id: '3', title: 'Behind Scenes', creator: 'By Sarah', viewers: '2.8K', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=500&fit=crop' },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewAll = (type: ViewAllType, title: string) => {
    navigation.navigate('ViewAll', { type, title });
  };

  const handleCreatorPress = (creator: { id: string; name: string; image?: string }) => {
    navigation.navigate('Channel', {
      id: creator.id,
      name: creator.name,
      avatar: creator.image,
    });
  };

  const handleLivestreamPress = (stream: typeof trendingLivestreams[0]) => {
    navigation.navigate('LiveStreamView', {
      id: stream.id,
      title: stream.title,
      creator: stream.creator.replace('By ', ''),
      viewers: stream.viewers,
      image: stream.image,
    });
  };

  const renderSectionHeader = (title: string, onViewAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNewReleaseCard = ({ item }: { item: typeof newReleases[0] }) => (
    <TouchableOpacity style={styles.releaseCard}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.releaseImage}
        imageStyle={{ borderRadius: spacing.borderRadius.md }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="play-circle" size={32} color={colors.textPrimary} />
      </ImageBackground>
      <Text style={styles.releaseTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderCircleAvatar = ({ item, type }: { item: any; type: 'club' | 'creator' }) => (
    <TouchableOpacity
      style={styles.circleItem}
      onPress={type === 'creator' ? () => handleCreatorPress(item) : undefined}
    >
      <View style={styles.circleAvatar}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} />
        ) : (
          <>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.circleInitial}>{item.name[0]}</Text>
          </>
        )}
      </View>
      <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.circleSubtext}>
        {type === 'club' ? item.members + ' Members' : item.followers + ' Followers'}
      </Text>
    </TouchableOpacity>
  );

  const renderLivestreamCard = ({ item }: { item: typeof trendingLivestreams[0] }) => (
    <TouchableOpacity
      style={styles.livestreamCard}
      onPress={() => handleLivestreamPress(item)}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.livestreamImage}
        imageStyle={{ borderRadius: spacing.borderRadius.md }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Live badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        {/* Viewer count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={12} color={colors.textPrimary} />
          <Text style={styles.viewerText}>{item.viewers}</Text>
        </View>
      </ImageBackground>
      <Text style={styles.livestreamTitle}>{item.title}</Text>
      <Text style={styles.livestreamCreator}>{item.creator}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos, creators, clubs..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* New Releases */}
        {renderSectionHeader('New Releases', () => handleViewAll('new_releases', 'New Releases'))}
        <FlatList
          horizontal
          data={newReleases}
          renderItem={renderNewReleaseCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Clubs */}
        {renderSectionHeader('Trending Clubs', () => handleViewAll('trending_clubs', 'Trending Clubs'))}
        <FlatList
          horizontal
          data={trendingClubs}
          renderItem={({ item }) => renderCircleAvatar({ item, type: 'club' })}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Creators */}
        {renderSectionHeader('Trending Creators', () => handleViewAll('trending_creators', 'Trending Creators'))}
        <FlatList
          horizontal
          data={trendingCreators}
          renderItem={({ item }) => renderCircleAvatar({ item, type: 'creator' })}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Livestreams */}
        {renderSectionHeader('Trending Livestreams', () => handleViewAll('trending_livestreams', 'Trending Livestreams'))}
        <FlatList
          horizontal
          data={trendingLivestreams}
          renderItem={renderLivestreamCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Talents */}
        {renderSectionHeader('Trending Talents', () => handleViewAll('trending_talents', 'Trending Talents'))}
        <FlatList
          horizontal
          data={trendingCreators.slice(0, 3)}
          renderItem={({ item }) => renderCircleAvatar({ item, type: 'creator' })}
          keyExtractor={(item) => `talent-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalList, styles.lastSection]}
        />
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  horizontalList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  lastSection: {
    marginBottom: spacing['3xl'],
  },
  // New Releases
  releaseCard: {
    width: 120,
  },
  releaseImage: {
    width: 120,
    height: 160,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  releaseTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  // Circle Avatars
  circleItem: {
    alignItems: 'center',
    width: 80,
  },
  circleAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  circleInitial: {
    color: colors.background,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  circleName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  circleSubtext: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  // Livestreams
  livestreamCard: {
    width: 160,
  },
  livestreamImage: {
    width: 160,
    height: 200,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
  },
  liveText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  viewerBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  viewerText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
  },
  livestreamTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  livestreamCreator: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});

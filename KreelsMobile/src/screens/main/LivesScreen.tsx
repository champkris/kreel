import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - spacing.screenPadding * 2 - spacing.md) / 2;

type TabType = 'available' | 'myLive';

// Mock data with images
const liveStreams = [
  { id: '1', title: 'Live Concert', creator: 'Olivia', viewers: '5.1K', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=500&fit=crop' },
  { id: '2', title: 'Gaming Stream', creator: 'Mike', viewers: '3.2K', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop' },
  { id: '3', title: 'Cooking Show', creator: 'Sarah', viewers: '2.8K', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop' },
  { id: '4', title: 'Fitness Class', creator: 'Emma', viewers: '4.5K', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop' },
  { id: '5', title: 'Art Studio', creator: 'Alex', viewers: '1.9K', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=500&fit=crop' },
  { id: '6', title: 'Talk Show', creator: 'James', viewers: '6.3K', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=500&fit=crop' },
];

export default function LivesScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<TabType>('available');

  const handleOpenLiveStream = (item: typeof liveStreams[0]) => {
    navigation.navigate('LiveStreamView', {
      id: item.id,
      title: item.title,
      creator: item.creator,
      viewers: item.viewers,
      image: item.image,
    });
  };

  const renderLiveCard = ({ item }: { item: typeof liveStreams[0] }) => (
    <TouchableOpacity style={styles.liveCard} onPress={() => handleOpenLiveStream(item)}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.liveImage}
        imageStyle={{ borderRadius: spacing.borderRadius.lg }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
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

        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={40} color="rgba(255,255,255,0.8)" />
        </View>
      </ImageBackground>

      <View style={styles.liveInfo}>
        <Text style={styles.liveTitle}>{item.title}</Text>
        <Text style={styles.liveCreator}>By {item.creator}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyMyLive = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Live Streams Yet</Text>
      <Text style={styles.emptyText}>
        Start your first live stream to connect with your audience
      </Text>
      <TouchableOpacity style={styles.startLiveButton}>
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          style={styles.startLiveGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="videocam" size={20} color={colors.background} />
          <Text style={styles.startLiveText}>Go Live</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lives</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'available' && styles.tabTextActive,
            ]}
          >
            Available Live
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myLive' && styles.tabActive]}
          onPress={() => setActiveTab('myLive')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'myLive' && styles.tabTextActive,
            ]}
          >
            My Live
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'available' ? (
        <FlatList
          data={liveStreams}
          renderItem={renderLiveCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyMyLive()
      )}
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
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  liveCard: {
    width: cardWidth,
  },
  liveImage: {
    width: cardWidth,
    height: cardWidth * 1.3,
    borderRadius: spacing.borderRadius.lg,
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
    top: spacing.sm,
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
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveInfo: {
    paddingHorizontal: spacing.xs,
  },
  liveTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  liveCreator: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startLiveButton: {
    borderRadius: spacing.buttonBorderRadius,
    overflow: 'hidden',
  },
  startLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  startLiveText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

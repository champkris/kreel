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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'Home' | 'Analytics' | 'Content' | 'Monetization';

// Mock data with images
const statsData = {
  followers: { value: '14.2k', change: '+5%', label: 'Followers' },
  views: { value: '1.4M', change: '+9%', label: 'Views' },
  revenue: { value: '$4,260', change: '+10%', label: 'Revenue' },
  engagement: { value: '8.6%', change: '+5%', label: 'Engagement' },
};

const analyticsData = {
  walletBalance: '$16,00.00',
  walletChange: '+456',
  conversionRate: '5.6%',
  percentage: '2.03%',
};

const topContent = [
  { id: '1', title: 'Hunter Man', views: 85, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop' },
  { id: '2', title: 'The Lost Girl', views: 40, image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=200&fit=crop' },
  { id: '3', title: 'Black Out', views: 8520, image: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=200&h=200&fit=crop' },
  { id: '4', title: 'The Last Whisper', views: 2201, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop' },
];

const contentData = {
  shortDramas: [
    { id: '1', title: 'Drama 1', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=400&fit=crop' },
    { id: '2', title: 'Drama 2', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop' },
    { id: '3', title: 'Drama 3', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop' },
  ],
  series: [
    { id: '1', title: 'Series 1', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=400&fit=crop' },
    { id: '2', title: 'Series 2', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=300&h=400&fit=crop' },
    { id: '3', title: 'Series 3', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=400&fit=crop' },
  ],
  liveStreams: [
    { id: '1', title: 'Live 1', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=400&fit=crop' },
    { id: '2', title: 'Live 2', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=400&fit=crop' },
    { id: '3', title: 'Live 3', views: 1412, comments: 349, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop' },
  ],
};

const monetizationData = {
  earnings: '$16,420',
  level: 'Level 1 — Rookie',
  progress: 40,
  nextLevel: 'Level 2 (Bronze)',
  requirements: [
    { label: '1,000 Followers', met: true },
    { label: 'Active Creator Account', met: true },
    { label: 'No Policy Violations', met: true },
  ],
};

export default function CreatorDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const navigation = useNavigation();

  const tabs: TabType[] = ['Home', 'Analytics', 'Content', 'Monetization'];

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatCard = (stat: { value: string; change: string; label: string }) => (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
      <View style={styles.statChange}>
        <Text style={styles.statChangeText}>{stat.change}</Text>
        <Text style={styles.statChangeLabel}>vs last month</Text>
      </View>
    </Card>
  );

  const renderAnalyticsChart = () => (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartIcon}>
          <Ionicons name="bar-chart" size={20} color={colors.textPrimary} />
        </View>
        <Text style={styles.chartTitle}>Analytics</Text>
        <TouchableOpacity style={styles.chartArrow}>
          <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.walletLabel}>Available revenue in your wallet</Text>
      <View style={styles.walletRow}>
        <Text style={styles.walletValue}>{analyticsData.walletBalance}</Text>
        <View style={styles.walletBadge}>
          <Text style={styles.walletBadgeText}>{analyticsData.walletChange}</Text>
        </View>
        <Text style={styles.walletPercentage}>{analyticsData.percentage}</Text>
      </View>
      <Text style={styles.conversionText}>
        Conversion Rate: <Text style={styles.conversionValue}>{analyticsData.conversionRate}</Text>
      </Text>

      {/* Placeholder chart */}
      <View style={styles.chartPlaceholder}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.chartLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <View style={styles.chartMonths}>
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
          <Text key={month} style={styles.chartMonth}>{month}</Text>
        ))}
      </View>
    </Card>
  );

  const renderHomeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(statsData.followers)}
        {renderStatCard(statsData.views)}
        {renderStatCard(statsData.revenue)}
        {renderStatCard(statsData.engagement)}
      </View>

      {/* Analytics Chart */}
      {renderAnalyticsChart()}

      {/* Last Published Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Published Content</Text>
        {topContent.slice(0, 2).map((content) => (
          <TouchableOpacity key={content.id} style={styles.contentItem}>
            <Image
              source={{ uri: content.image }}
              style={styles.contentThumbnail}
            />
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{content.title}</Text>
              <Text style={styles.contentMeta}>First 77 days 18 hours</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Creator Analytics</Text>

      {/* Analytics Chart */}
      {renderAnalyticsChart()}

      {/* Top Content */}
      <Card style={styles.topContentCard}>
        <View style={styles.topContentHeader}>
          <Text style={styles.topContentTitle}>Top Content</Text>
          <Text style={styles.topContentSubtitle}>Last 28 days</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {topContent.map((content, index) => (
          <View key={content.id} style={styles.topContentItem}>
            <Image
              source={{ uri: content.image }}
              style={styles.topContentThumbnail}
            />
            <Text style={styles.topContentName}>{content.title}</Text>
            <Text style={styles.topContentViews}>{content.views}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderContentTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Short Dramas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Short Dramas</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentGrid}>
          {contentData.shortDramas.map((item) => (
            <View key={item.id} style={styles.contentGridItem}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.contentGridThumbnail}
                imageStyle={{ borderRadius: spacing.borderRadius.md }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={StyleSheet.absoluteFill}
                />
              </ImageBackground>
              <View style={styles.contentGridStats}>
                <Ionicons name="eye" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.views}</Text>
                <Ionicons name="chatbubble" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.comments}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Series */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Series</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentGrid}>
          {contentData.series.map((item) => (
            <View key={item.id} style={styles.contentGridItem}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.contentGridThumbnail}
                imageStyle={{ borderRadius: spacing.borderRadius.md }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={StyleSheet.absoluteFill}
                />
              </ImageBackground>
              <View style={styles.contentGridStats}>
                <Ionicons name="eye" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.views}</Text>
                <Ionicons name="chatbubble" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.comments}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Live Stream */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Stream</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentGrid}>
          {contentData.liveStreams.map((item) => (
            <View key={item.id} style={styles.contentGridItem}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.contentGridThumbnail}
                imageStyle={{ borderRadius: spacing.borderRadius.md }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={StyleSheet.absoluteFill}
                />
              </ImageBackground>
              <View style={styles.contentGridStats}>
                <Ionicons name="eye" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.views}</Text>
                <Ionicons name="chatbubble" size={12} color={colors.textMuted} />
                <Text style={styles.contentGridStatText}>{item.comments}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderMonetizationTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Eligibility */}
      <Card style={styles.eligibilityCard}>
        <Text style={styles.eligibilityTitle}>Eligibility Requirements</Text>
        {monetizationData.requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <Ionicons
              name={req.met ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={req.met ? colors.success : colors.error}
            />
            <Text style={styles.requirementText}>{req.label}</Text>
          </View>
        ))}
      </Card>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply for Monetization</Text>
      </TouchableOpacity>

      {/* Earnings Card */}
      <Card style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Earnings</Text>
        <Text style={styles.earningsValue}>{monetizationData.earnings}</Text>
      </Card>

      {/* Level Card */}
      <View style={styles.levelSection}>
        <Text style={styles.levelLabel}>Your Level</Text>
        <Card style={styles.levelCard}>
          <Text style={styles.levelValue}>{monetizationData.level}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${monetizationData.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {monetizationData.progress}% progress to {monetizationData.nextLevel}
          </Text>
        </Card>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeTab();
      case 'Analytics':
        return renderAnalyticsTab();
      case 'Content':
        return renderContentTab();
      case 'Monetization':
        return renderMonetizationTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
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
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  tab: {
    backgroundColor: colors.surface,
    borderRadius: spacing.buttonBorderRadiusSmall,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (screenWidth - spacing.screenPadding * 2 - spacing.md) / 2,
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statChangeText: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statChangeLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // Chart
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chartTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  chartArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  walletValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  walletBadge: {
    backgroundColor: colors.success,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  walletBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  walletPercentage: {
    color: colors.success,
    fontSize: typography.fontSize.md,
  },
  conversionText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
  },
  conversionValue: {
    color: colors.primary,
  },
  chartPlaceholder: {
    height: 100,
    marginBottom: spacing.md,
    justifyContent: 'flex-end',
  },
  chartLine: {
    height: 2,
    borderRadius: 1,
  },
  chartMonths: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartMonth: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  contentItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  contentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contentTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  contentMeta: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // Top Content
  topContentCard: {
    marginBottom: spacing.lg,
  },
  topContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  topContentTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  topContentSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.sm,
  },
  topContentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topContentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.sm,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  topContentName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
  },
  topContentViews: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  // Content Grid
  contentGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contentGridItem: {
    width: (screenWidth - spacing.screenPadding * 2 - spacing.md * 2) / 3,
  },
  contentGridThumbnail: {
    aspectRatio: 3 / 4,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  contentGridStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contentGridStatText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginRight: spacing.sm,
  },
  // Monetization
  eligibilityCard: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  eligibilityTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  requirementText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
  },
  applyButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  applyButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  earningsCard: {
    marginBottom: spacing.lg,
  },
  earningsLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  levelSection: {
    marginBottom: spacing.lg,
  },
  levelLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  levelCard: {},
  levelValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});

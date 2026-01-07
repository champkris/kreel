import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { notificationsAPI } from '../services/api';
import NotificationItem from '../components/notifications/NotificationItem';
import { colors } from '../theme/colors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    page,
    setNotifications,
    appendNotifications,
    markAsRead,
    markAllAsRead,
    setLoading,
    setPage,
    setHasMore,
    setUnreadCount,
  } = useNotificationStore();

  const fetchNotifications = useCallback(
    async (pageNum = 1, refresh = false) => {
      if (isLoading && !refresh) return;
      setLoading(true);

      try {
        const response = await notificationsAPI.getNotifications(pageNum, 20);
        if (response.success) {
          if (refresh || pageNum === 1) {
            setNotifications(response.data);
          } else {
            appendNotifications(response.data);
          }
          setUnreadCount(response.unreadCount);
          setHasMore(response.pagination.page < response.pagination.totalPages);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [
      isLoading,
      setLoading,
      setNotifications,
      appendNotifications,
      setUnreadCount,
      setHasMore,
      setPage,
    ]
  );

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  const handleRefresh = () => {
    fetchNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
      await notificationsAPI.markAsRead(notification.id);
    }

    // Navigate based on notification type
    const { type, data } = notification;
    switch (type) {
      case 'FOLLOW':
        navigation.navigate('Channel' as never, { id: data?.userId } as never);
        break;
      case 'LIKE':
      case 'COMMENT':
      case 'COMMENT_REPLY':
      case 'NEW_VIDEO':
        navigation.navigate('VideoDetail' as never, { id: data?.videoId } as never);
        break;
      case 'CHALLENGE_NEW':
      case 'CHALLENGE_ENTRY':
      case 'CHALLENGE_VOTE':
      case 'CHALLENGE_WIN':
      case 'CHALLENGE_ENDING':
        navigation.navigate(
          'ChallengeDetail' as never,
          { challengeId: data?.challengeId } as never
        );
        break;
      case 'LIVE_STARTING':
        navigation.navigate(
          'LiveStreamView' as never,
          { id: data?.liveStreamId } as never
        );
        break;
      case 'WALLET_CREDIT':
      case 'WALLET_DEBIT':
      case 'GIFT_RECEIVED':
      case 'REWARD_EARNED':
        navigation.navigate('Wallet' as never);
        break;
      case 'CLUB_NEW_POST':
        navigation.navigate('ClubDetail' as never, { clubId: data?.clubId } as never);
        break;
      case 'PROFILE_INCOMPLETE':
        navigation.navigate('PersonalInfo' as never);
        break;
      default:
        // Stay on notifications screen
        break;
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();
    await notificationsAPI.markAllAsRead();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 ? (
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={64}
        color={colors.textMuted}
      />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        When you get notifications, they'll show up here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={
          notifications.length === 0 && !isLoading ? styles.emptyList : undefined
        }
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  markAllButton: {
    padding: 4,
  },
  markAllRead: {
    fontSize: 14,
    color: colors.primary,
  },
  placeholder: {
    width: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
  },
});

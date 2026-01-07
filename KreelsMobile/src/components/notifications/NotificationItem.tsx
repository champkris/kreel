import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../store/notificationStore';
import { colors } from '../../theme/colors';

interface Props {
  notification: Notification;
  onPress: () => void;
}

const notificationIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  FOLLOW: { name: 'person-add', color: '#4CAF50' },
  LIKE: { name: 'heart', color: '#E91E63' },
  COMMENT: { name: 'chatbubble', color: '#2196F3' },
  COMMENT_REPLY: { name: 'chatbubbles', color: '#2196F3' },
  MENTION: { name: 'at', color: '#9C27B0' },
  GIFT_RECEIVED: { name: 'gift', color: '#FF9800' },
  CHALLENGE_NEW: { name: 'trophy', color: '#9C27B0' },
  CHALLENGE_ENTRY: { name: 'document-text', color: '#9C27B0' },
  CHALLENGE_VOTE: { name: 'thumbs-up', color: '#9C27B0' },
  CHALLENGE_WIN: { name: 'medal', color: '#FFD700' },
  CHALLENGE_ENDING: { name: 'alarm', color: '#FF9800' },
  LIVE_STARTING: { name: 'radio', color: '#F44336' },
  CLUB_NEW_POST: { name: 'people', color: '#00BCD4' },
  NEW_VIDEO: { name: 'videocam', color: '#2196F3' },
  WALLET_CREDIT: { name: 'wallet', color: '#4CAF50' },
  WALLET_DEBIT: { name: 'wallet', color: '#F44336' },
  REWARD_EARNED: { name: 'star', color: '#FFD700' },
  BADGE_EARNED: { name: 'ribbon', color: '#FFD700' },
  LEVEL_UP: { name: 'trending-up', color: '#4CAF50' },
  PROFILE_INCOMPLETE: { name: 'alert-circle', color: '#FF9800' },
  SYSTEM_ANNOUNCEMENT: { name: 'megaphone', color: '#2196F3' },
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({ notification, onPress }: Props) {
  const iconConfig = notificationIcons[notification.type] || {
    name: 'notifications' as keyof typeof Ionicons.glyphMap,
    color: colors.primary,
  };

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {notification.actor?.avatar ? (
        <Image source={{ uri: notification.actor.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + '20' }]}>
          <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.time}>{getTimeAgo(notification.createdAt)}</Text>
      </View>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: colors.primary + '15',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
});

import { prisma } from '../index';
import { NotificationType } from '@prisma/client';
import { sendPushNotification } from '../utils/pushNotifications';
import { Server } from 'socket.io';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actorId?: string;
  targetId?: string;
  targetType?: string;
}

interface NotificationPayload {
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    data: any;
    imageUrl?: string;
    isRead: boolean;
    createdAt: Date;
    actor?: {
      id: string;
      displayName: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
  unreadCount: number;
}

class NotificationService {
  private io: Server | null = null;

  setSocketIO(io: Server) {
    this.io = io;
  }

  async createNotification(params: CreateNotificationParams): Promise<NotificationPayload | null> {
    const { userId, type, title, body, data, imageUrl, actorId, targetId, targetType } = params;

    try {
      // Check user notification settings
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      // Check if this notification type is enabled
      if (settings && !this.isNotificationEnabled(settings, type)) {
        return null;
      }

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
          data,
          imageUrl,
          actorId,
          targetId,
          targetType
        },
        include: {
          actor: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              username: true
            }
          }
        }
      });

      // Get unread count
      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      const payload: NotificationPayload = {
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          imageUrl: notification.imageUrl || undefined,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          actor: notification.actor || undefined
        },
        unreadCount
      };

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user-${userId}`).emit('notification', payload);
      }

      // Send push notification
      await this.sendPush(userId, type, title, body, data, imageUrl);

      return payload;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  private async sendPush(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    imageUrl?: string
  ) {
    try {
      // Check if push is enabled for this notification type
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      if (settings && !settings.pushEnabled) {
        return;
      }

      // Check specific push setting for this type
      if (settings && !this.isPushEnabled(settings, type)) {
        return;
      }

      const pushTokens = await prisma.pushToken.findMany({
        where: { userId, isActive: true }
      });

      if (pushTokens.length === 0) return;

      const tokens = pushTokens.map(t => t.token);
      await sendPushNotification(tokens, {
        title,
        body,
        data: { type, ...data },
        imageUrl
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private isNotificationEnabled(settings: any, type: NotificationType): boolean {
    if (!settings.inAppEnabled) return false;
    return true; // By default, all notifications are enabled in-app
  }

  private isPushEnabled(settings: any, type: NotificationType): boolean {
    const typeToSetting: Record<string, keyof typeof settings> = {
      FOLLOW: 'pushFollows',
      LIKE: 'pushLikes',
      COMMENT: 'pushComments',
      COMMENT_REPLY: 'pushComments',
      MENTION: 'pushComments',
      GIFT_RECEIVED: 'pushGifts',
      CHALLENGE_NEW: 'pushChallenges',
      CHALLENGE_ENTRY: 'pushChallenges',
      CHALLENGE_VOTE: 'pushChallenges',
      CHALLENGE_WIN: 'pushChallenges',
      CHALLENGE_ENDING: 'pushChallenges',
      LIVE_STARTING: 'pushLiveStreams',
      WALLET_CREDIT: 'pushWallet',
      WALLET_DEBIT: 'pushWallet',
      REWARD_EARNED: 'pushWallet',
      PROFILE_INCOMPLETE: 'pushProfileReminders',
      BADGE_EARNED: 'pushWallet',
      LEVEL_UP: 'pushWallet'
    };

    const settingKey = typeToSetting[type];
    return settingKey ? settings[settingKey] !== false : true;
  }

  // Bulk notification for followers (e.g., new video, going live)
  async notifyFollowers(
    creatorId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    imageUrl?: string
  ) {
    try {
      const followers = await prisma.follow.findMany({
        where: { followingId: creatorId },
        select: { followerId: true }
      });

      const promises = followers.map(f =>
        this.createNotification({
          userId: f.followerId,
          type,
          title,
          body,
          data,
          actorId: creatorId,
          imageUrl
        })
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  }

  // Club-wide notification
  async notifyClubMembers(
    clubId: string,
    excludeUserId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      const members = await prisma.clubMember.findMany({
        where: { clubId, userId: { not: excludeUserId } },
        select: { userId: true }
      });

      const promises = members.map(m =>
        this.createNotification({
          userId: m.userId,
          type,
          title,
          body,
          data
        })
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error notifying club members:', error);
    }
  }
}

export const notificationService = new NotificationService();

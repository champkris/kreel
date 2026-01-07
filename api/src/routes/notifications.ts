import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import { isValidExpoPushToken } from '../utils/pushNotifications';

const router = express.Router();

// Get notifications with pagination
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const unreadOnly = req.query.unreadOnly === 'true';
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch notifications' }
    });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get unread count' }
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark notification as read' }
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark notifications as read' }
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.notification.deleteMany({
      where: { id, userId }
    });

    res.json({ success: true, data: { message: 'Notification deleted' } });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete notification' }
    });
  }
});

// Register push token
router.post('/push-token', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { token, platform, deviceId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Push token is required' }
      });
    }

    // Validate Expo push token format
    if (!isValidExpoPushToken(token)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid push token format' }
      });
    }

    // Upsert push token
    const pushToken = await prisma.pushToken.upsert({
      where: { token },
      update: {
        userId,
        platform: platform || 'unknown',
        deviceId,
        isActive: true,
        lastUsedAt: new Date()
      },
      create: {
        userId,
        token,
        platform: platform || 'unknown',
        deviceId
      }
    });

    res.json({ success: true, data: pushToken });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to register push token' }
    });
  }
});

// Deactivate push token (for logout)
router.delete('/push-token', authenticate, async (req: AuthRequest, res) => {
  try {
    const { token } = req.body;

    if (token) {
      await prisma.pushToken.updateMany({
        where: { token },
        data: { isActive: false }
      });
    }

    res.json({ success: true, data: { message: 'Push token deactivated' } });
  } catch (error) {
    console.error('Error deactivating push token:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to deactivate push token' }
    });
  }
});

// Get notification settings
router.get('/settings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get notification settings' }
    });
  }
});

// Update notification settings
router.put('/settings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      pushEnabled,
      pushFollows,
      pushLikes,
      pushComments,
      pushGifts,
      pushChallenges,
      pushLiveStreams,
      pushWallet,
      pushProfileReminders,
      inAppEnabled,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd
    } = req.body;

    const updated = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(pushFollows !== undefined && { pushFollows }),
        ...(pushLikes !== undefined && { pushLikes }),
        ...(pushComments !== undefined && { pushComments }),
        ...(pushGifts !== undefined && { pushGifts }),
        ...(pushChallenges !== undefined && { pushChallenges }),
        ...(pushLiveStreams !== undefined && { pushLiveStreams }),
        ...(pushWallet !== undefined && { pushWallet }),
        ...(pushProfileReminders !== undefined && { pushProfileReminders }),
        ...(inAppEnabled !== undefined && { inAppEnabled }),
        ...(quietHoursEnabled !== undefined && { quietHoursEnabled }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd })
      },
      create: {
        userId,
        pushEnabled,
        pushFollows,
        pushLikes,
        pushComments,
        pushGifts,
        pushChallenges,
        pushLiveStreams,
        pushWallet,
        pushProfileReminders,
        inAppEnabled,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update notification settings' }
    });
  }
});

export default router;

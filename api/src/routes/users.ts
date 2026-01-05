import express from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Get list of creators (users with videos)
router.get('/creators', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [creators, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          videos: {
            some: {
              isPublished: true,
              isActive: true
            }
          }
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          userType: true,
          experiencePoints: true,
          currentLevel: true,
          currentRank: true,
          badges: {
            include: {
              badge: true
            }
          },
          _count: {
            select: {
              followers: true,
              following: true,
              videos: {
                where: {
                  isPublished: true,
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: [
          { currentLevel: 'desc' },
          { experiencePoints: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({
        where: {
          videos: {
            some: {
              isPublished: true,
              isActive: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: creators.map(creator => ({
        ...creator,
        followersCount: creator._count.followers,
        followingCount: creator._count.following,
        videosCount: creator._count.videos,
        badges: creator.badges.map(ub => ({
          ...ub.badge,
          earnedAt: ub.earnedAt
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch creators' }
    });
  }
});

// Get user profile by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        userType: true,
        experiencePoints: true,
        currentLevel: true,
        createdAt: true,
        currentRank: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            videos: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        videosCount: user._count.videos,
        badges: user.badges.map(ub => ({
          ...ub.badge,
          earnedAt: ub.earnedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user profile' }
    });
  }
});

// Update user profile
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile (unless admin)
    if (req.user?.id !== id && req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only update your own profile' }
      });
    }

    const { displayName, bio, avatar, country, language } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(country && { country }),
        ...(language && { language })
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        country: true,
        language: true,
        userType: true,
        experiencePoints: true,
        currentLevel: true
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' }
    });
  }
});

// Get user badges
router.get('/:id/badges', async (req, res) => {
  try {
    const { id } = req.params;

    const badges = await prisma.userBadge.findMany({
      where: { userId: id },
      include: {
        badge: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    res.json({
      success: true,
      data: badges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
        contentId: ub.contentId
      }))
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch badges' }
    });
  }
});

// Follow a user
router.post('/:id/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user!.id;

    if (followerId === id) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot follow yourself' }
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: id
      }
    });

    res.json({
      success: true,
      data: { message: 'Successfully followed user', follow }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'You are already following this user' }
      });
    }
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to follow user' }
    });
  }
});

// Unfollow a user
router.delete('/:id/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user!.id;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id
        }
      }
    });

    res.json({
      success: true,
      data: { message: 'Successfully unfollowed user' }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).json({
        success: false,
        error: { message: 'You are not following this user' }
      });
    }
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to unfollow user' }
    });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follow.count({ where: { followingId: id } })
    ]);

    res.json({
      success: true,
      data: followers.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch followers' }
    });
  }
});

// Get users the user is following
router.get('/:id/following', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follow.count({ where: { followerId: id } })
    ]);

    res.json({
      success: true,
      data: following.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch following' }
    });
  }
});

// Check if current user is following another user
router.get('/:id/is-following', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user!.id;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id
        }
      }
    });

    res.json({
      success: true,
      data: { isFollowing: !!follow }
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check follow status' }
    });
  }
});

// Get current user's profile (authenticated)
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        phone: true,
        userType: true,
        country: true,
        language: true,
        experiencePoints: true,
        currentLevel: true,
        createdAt: true,
        currentRank: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            videos: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        videosCount: user._count.videos,
        badges: user.badges.map(ub => ({
          ...ub.badge,
          earnedAt: ub.earnedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch profile' }
    });
  }
});

export default router;

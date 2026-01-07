import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Get video feed
router.get('/feed', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          isActive: true,
          isPublished: true
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              badges: {
                include: { badge: true },
                take: 3
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.video.count({
        where: {
          isActive: true,
          isPublished: true
        }
      })
    ]);

    res.json({
      success: true,
      data: videos.map(v => ({
        ...v,
        likesCount: v._count.likes,
        commentsCount: v._count.comments,
        price: v.price ? parseFloat(v.price.toString()) : null,
        creator: {
          ...v.creator,
          badges: v.creator.badges.map(ub => ub.badge)
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching video feed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch video feed' }
    });
  }
});

// Get single video
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            badges: {
              include: { badge: true },
              take: 5
            },
            _count: {
              select: { followers: true }
            }
          }
        },
        series: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Increment view count
    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: {
        ...video,
        likesCount: video._count.likes,
        commentsCount: video._count.comments,
        price: video.price ? parseFloat(video.price.toString()) : null,
        creator: {
          ...video.creator,
          followersCount: video.creator._count.followers,
          badges: video.creator.badges.map(ub => ub.badge)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch video' }
    });
  }
});

// Upload video metadata (actual file upload would go to cloud storage)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const creatorId = req.user!.id;
    const {
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      seriesId,
      episodeNumber,
      accessType = 'FREE',
      price,
      previewDuration
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title is required' }
      });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        thumbnail,
        videoUrl,
        duration,
        creatorId,
        seriesId,
        episodeNumber,
        accessType,
        price,
        previewDuration,
        isPaid: accessType === 'PAID',
        isFree: accessType === 'FREE',
        isPublished: true
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    // Award XP for uploading content
    await prisma.user.update({
      where: { id: creatorId },
      data: {
        experiencePoints: { increment: 100 }
      }
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create video' }
    });
  }
});

// Like/Unlike video
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: { userId, videoId: id }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });

      await prisma.video.update({
        where: { id },
        data: { likeCount: { decrement: 1 } }
      });

      return res.json({
        success: true,
        data: { liked: false, message: 'Video unliked' }
      });
    } else {
      // Like
      await prisma.like.create({
        data: { userId, videoId: id }
      });

      await prisma.video.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      });

      // Award XP to video creator for getting a like
      if (video.creatorId !== userId) {
        await prisma.user.update({
          where: { id: video.creatorId },
          data: { experiencePoints: { increment: 1 } }
        });

        // Send notification to video creator
        const liker = await prisma.user.findUnique({
          where: { id: userId },
          select: { displayName: true, username: true, avatar: true }
        });

        notificationService.createNotification({
          userId: video.creatorId,
          type: 'LIKE',
          title: 'New Like',
          body: `${liker?.displayName || liker?.username || 'Someone'} liked your video`,
          actorId: userId,
          targetId: id,
          targetType: 'video',
          data: { videoId: id },
          imageUrl: video.thumbnail || liker?.avatar || undefined
        });
      }

      return res.json({
        success: true,
        data: { liked: true, message: 'Video liked' }
      });
    }
  } catch (error) {
    console.error('Error liking video:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to like video' }
    });
  }
});

// Check if user liked a video
router.get('/:id/liked', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const like = await prisma.like.findUnique({
      where: {
        userId_videoId: { userId, videoId: id }
      }
    });

    res.json({
      success: true,
      data: { liked: !!like }
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check like status' }
    });
  }
});

// Get video comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          videoId: id,
          isActive: true,
          parentId: null // Only top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          replies: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 3
          },
          _count: {
            select: { replies: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({
        where: {
          videoId: id,
          isActive: true,
          parentId: null
        }
      })
    ]);

    res.json({
      success: true,
      data: comments.map(c => ({
        ...c,
        repliesCount: c._count.replies
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch comments' }
    });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content, parentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Comment content is required' }
      });
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // If it's a reply, check parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.videoId !== id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid parent comment' }
        });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        videoId: id,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    // Send notification to video creator for new comment
    if (video.creatorId !== userId) {
      const commenter = comment.user;
      const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;

      notificationService.createNotification({
        userId: video.creatorId,
        type: 'COMMENT',
        title: 'New Comment',
        body: `${commenter.displayName || commenter.username || 'Someone'}: "${truncatedContent}"`,
        actorId: userId,
        targetId: comment.id,
        targetType: 'comment',
        data: { videoId: id, commentId: comment.id },
        imageUrl: commenter.avatar || video.thumbnail || undefined
      });
    }

    // Send notification for replies
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true }
      });

      if (parentComment && parentComment.userId !== userId) {
        const replier = comment.user;
        const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;

        notificationService.createNotification({
          userId: parentComment.userId,
          type: 'COMMENT_REPLY',
          title: 'New Reply',
          body: `${replier.displayName || replier.username || 'Someone'} replied: "${truncatedContent}"`,
          actorId: userId,
          targetId: comment.id,
          targetType: 'comment',
          data: { videoId: id, commentId: comment.id, parentCommentId: parentId },
          imageUrl: replier.avatar || undefined
        });
      }
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add comment' }
    });
  }
});

// Delete comment
router.delete('/:videoId/comments/:commentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Comment not found' }
      });
    }

    // Only comment author or admin can delete
    if (comment.userId !== userId && req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this comment' }
      });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: { message: 'Comment deleted' }
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete comment' }
    });
  }
});

// Share video (increment share count)
router.post('/:id/share', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.update({
      where: { id },
      data: { shareCount: { increment: 1 } }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    res.json({
      success: true,
      data: { shareCount: video.shareCount }
    });
  } catch (error) {
    console.error('Error sharing video:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to share video' }
    });
  }
});

// Get videos by creator
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          creatorId,
          isActive: true,
          isPublished: true
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.video.count({
        where: {
          creatorId,
          isActive: true,
          isPublished: true
        }
      })
    ]);

    res.json({
      success: true,
      data: videos.map(v => ({
        ...v,
        likesCount: v._count.likes,
        commentsCount: v._count.comments,
        price: v.price ? parseFloat(v.price.toString()) : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching creator videos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch videos' }
    });
  }
});

export default router;

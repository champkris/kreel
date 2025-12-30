import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// GET /series - List all series with episode counts
router.get('/', async (req, res) => {
  try {
    const { category, creatorId, limit = '20', offset = '0' } = req.query;

    const where: any = {
      isPublished: true,
      isActive: true,
    };

    if (category) {
      where.category = category as string;
    }

    if (creatorId) {
      where.creatorId = creatorId as string;
    }

    const series = await prisma.series.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            badges: {
              include: {
                badge: true,
              },
            },
          },
        },
        videos: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            accessType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Transform data to include episode counts by access type
    const transformedSeries = series.map((s) => {
      const episodes = s.videos;
      const freeCount = episodes.filter((e) => e.accessType === 'FREE').length;
      const lockedCount = episodes.filter((e) => e.accessType === 'LOCKED').length;
      const paidCount = episodes.filter((e) => e.accessType === 'PAID').length;

      // Check if creator has official badge
      const isVerified = s.creator.badges?.some(
        (b) => b.badge.type === 'OFFICIAL' || b.badge.type === 'VERIFIED_CREATOR'
      );

      return {
        id: s.id,
        title: s.title,
        description: s.description,
        thumbnail: s.thumbnail,
        banner: s.banner,
        category: s.category,
        tags: s.tags,
        price: s.price,
        isPaid: s.isPaid,
        freeEpisodeCount: s.freeEpisodeCount,
        totalEpisodes: episodes.length,
        duration: s.duration,
        language: s.language,
        creator: {
          id: s.creator.id,
          username: s.creator.username,
          displayName: s.creator.displayName,
          avatar: s.creator.avatar,
          isVerified,
        },
        episodeCounts: {
          free: freeCount,
          locked: lockedCount,
          paid: paidCount,
          total: episodes.length,
        },
        createdAt: s.createdAt,
        publishedAt: s.publishedAt,
      };
    });

    res.json({
      success: true,
      data: transformedSeries,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: await prisma.series.count({ where }),
      },
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch series',
    });
  }
});

// GET /series/:id - Get series details with episodes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            followersCount: true,
            badges: {
              include: {
                badge: true,
              },
            },
          },
        },
        videos: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { seasonNumber: 'asc' },
            { episodeNumber: 'asc' },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoUrl: true,
            duration: true,
            episodeNumber: true,
            seasonNumber: true,
            accessType: true,
            price: true,
            previewDuration: true,
            viewCount: true,
            likeCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!series) {
      return res.status(404).json({
        success: false,
        error: 'Series not found',
      });
    }

    // Calculate episode counts by access type
    const episodes = series.videos;
    const freeCount = episodes.filter((e) => e.accessType === 'FREE').length;
    const lockedCount = episodes.filter((e) => e.accessType === 'LOCKED').length;
    const paidCount = episodes.filter((e) => e.accessType === 'PAID').length;

    // Group episodes by season
    const seasons: Record<number, typeof episodes> = {};
    episodes.forEach((ep) => {
      const season = ep.seasonNumber || 1;
      if (!seasons[season]) {
        seasons[season] = [];
      }
      seasons[season].push(ep);
    });

    // Check if creator has official badge
    const isVerified = series.creator.badges?.some(
      (b) => b.badge.type === 'OFFICIAL' || b.badge.type === 'VERIFIED_CREATOR'
    );

    // Transform creator badges
    const creatorBadges = series.creator.badges?.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      type: ub.badge.type,
      icon: ub.badge.icon,
      description: ub.badge.description,
      color: ub.badge.color,
      earnedAt: ub.earnedAt,
    }));

    const transformedSeries = {
      id: series.id,
      title: series.title,
      description: series.description,
      thumbnail: series.thumbnail,
      banner: series.banner,
      category: series.category,
      tags: series.tags,
      price: series.price,
      isPaid: series.isPaid,
      freeEpisodeCount: series.freeEpisodeCount,
      totalEpisodes: episodes.length,
      duration: series.duration,
      language: series.language,
      creator: {
        id: series.creator.id,
        username: series.creator.username,
        displayName: series.creator.displayName,
        avatar: series.creator.avatar,
        bio: series.creator.bio,
        followersCount: series.creator.followersCount,
        isVerified,
        badges: creatorBadges,
      },
      episodeCounts: {
        free: freeCount,
        locked: lockedCount,
        paid: paidCount,
        total: episodes.length,
      },
      seasons: Object.entries(seasons).map(([seasonNum, eps]) => ({
        seasonNumber: parseInt(seasonNum),
        episodes: eps.map((ep) => ({
          ...ep,
          duration: ep.duration,
        })),
      })),
      createdAt: series.createdAt,
      publishedAt: series.publishedAt,
    };

    res.json({
      success: true,
      data: transformedSeries,
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch series',
    });
  }
});

export default router;

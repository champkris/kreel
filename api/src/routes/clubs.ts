import express from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const onlyOfficial = req.query.official === 'true';

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (onlyOfficial) {
      where.isOfficial = true;
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              members: true,
              challenges: true
            }
          }
        },
        orderBy: [
          { isOfficial: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.club.count({ where })
    ]);

    res.json({
      success: true,
      data: clubs.map(c => ({
        ...c,
        membersCount: c._count.members,
        challengesCount: c._count.challenges
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch clubs' }
    });
  }
});

// Get single club
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
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
        members: {
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
          take: 10
        },
        challenges: {
          where: { status: { in: ['ACTIVE', 'VOTING'] } },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            challenges: true
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    res.json({
      success: true,
      data: {
        ...club,
        membersCount: club._count.members,
        challengesCount: club._count.challenges,
        owner: {
          ...club.owner,
          badges: club.owner.badges.map(ub => ub.badge)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch club' }
    });
  }
});

// Create club
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const ownerId = req.user!.id;
    const { name, description, avatar, banner, isPrivate } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Club name is required' }
      });
    }

    // Check if club name is already taken
    const existingClub = await prisma.club.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingClub) {
      return res.status(400).json({
        success: false,
        error: { message: 'Club name is already taken' }
      });
    }

    // Create club and add owner as member
    const club = await prisma.club.create({
      data: {
        name: name.trim(),
        description,
        avatar,
        banner,
        ownerId,
        isPrivate: isPrivate || false,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER'
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...club,
        membersCount: club._count.members
      }
    });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create club' }
    });
  }
});

// Update club
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description, avatar, banner, isPrivate } = req.body;

    // Check if user is club owner or admin
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    if (club.members.length === 0 && req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this club' }
      });
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(avatar && { avatar }),
        ...(banner && { banner }),
        ...(isPrivate !== undefined && { isPrivate })
      }
    });

    res.json({
      success: true,
      data: updatedClub
    });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update club' }
    });
  }
});

// Join club
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const club = await prisma.club.findUnique({
      where: { id }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    // Check if already a member
    const existingMember = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: { clubId: id, userId }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: { message: 'You are already a member of this club' }
      });
    }

    // For private clubs, we might want to implement a request system later
    if (club.isPrivate) {
      return res.status(403).json({
        success: false,
        error: { message: 'This is a private club. You need an invitation to join.' }
      });
    }

    const member = await prisma.clubMember.create({
      data: {
        clubId: id,
        userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json({
      success: true,
      data: { message: 'Successfully joined the club', member }
    });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to join club' }
    });
  }
});

// Leave club
router.delete('/:id/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const club = await prisma.club.findUnique({
      where: { id }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    // Owner cannot leave - must transfer ownership first
    if (club.ownerId === userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Club owner cannot leave. Transfer ownership first.' }
      });
    }

    await prisma.clubMember.delete({
      where: {
        clubId_userId: { clubId: id, userId }
      }
    });

    res.json({
      success: true,
      data: { message: 'Successfully left the club' }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).json({
        success: false,
        error: { message: 'You are not a member of this club' }
      });
    }
    console.error('Error leaving club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to leave club' }
    });
  }
});

// Get club members
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.clubMember.findMany({
        where: { clubId: id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.clubMember.count({ where: { clubId: id } })
    ]);

    res.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch members' }
    });
  }
});

// Check if user is a member
router.get('/:id/is-member', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: { clubId: id, userId }
      }
    });

    res.json({
      success: true,
      data: {
        isMember: !!member,
        role: member?.role || null
      }
    });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check membership' }
    });
  }
});

// Request official verification (admin will review)
router.post('/:id/request-verification', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const club = await prisma.club.findUnique({
      where: { id }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    if (club.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only club owner can request verification' }
      });
    }

    if (club.verificationStatus !== 'NONE') {
      return res.status(400).json({
        success: false,
        error: { message: `Verification already ${club.verificationStatus.toLowerCase()}` }
      });
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        verificationStatus: 'PENDING'
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Verification request submitted',
        verificationStatus: updatedClub.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error requesting verification:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to request verification' }
    });
  }
});

// Admin: Verify club as official
router.put('/:id/verify', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { approved, note } = req.body;

    const club = await prisma.club.findUnique({
      where: { id }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { message: 'Club not found' }
      });
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        isOfficial: approved,
        verificationStatus: approved ? 'APPROVED' : 'REJECTED',
        officialVerifiedAt: approved ? new Date() : null,
        verificationNote: note
      }
    });

    // If approved, award CLUB_FOUNDER badge to owner
    if (approved) {
      const badge = await prisma.badge.findFirst({
        where: { type: 'CLUB_FOUNDER' }
      });

      if (badge) {
        await prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: club.ownerId,
              badgeId: badge.id
            }
          },
          create: {
            userId: club.ownerId,
            badgeId: badge.id,
            contentId: club.id
          },
          update: {}
        });
      }
    }

    res.json({
      success: true,
      data: {
        message: approved ? 'Club verified as official' : 'Verification rejected',
        club: updatedClub
      }
    });
  } catch (error) {
    console.error('Error verifying club:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify club' }
    });
  }
});

// Get clubs user is a member of
router.get('/my/memberships', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    res.json({
      success: true,
      data: memberships.map(m => ({
        ...m.club,
        membersCount: m.club._count.members,
        myRole: m.role,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch memberships' }
    });
  }
});

export default router;

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createChallengeValidation = [
  body('clubId').isString().notEmpty(),
  body('title').isString().isLength({ min: 3, max: 200 }),
  body('description').isString().isLength({ min: 10, max: 5000 }),
  body('type').isIn([
    'STORY_CO_CREATION',
    'CHARACTER_DEVELOPMENT',
    'ALTERNATE_ENDING',
    'WORLDBUILDING',
    'THEME_MICRO'
  ]),
  body('submissionEnd').isISO8601().toDate(),
  body('votingEnd').optional().isISO8601().toDate(),
  body('maxWinners').optional().isInt({ min: 1, max: 10 }),
  body('wordLimit').optional().isInt({ min: 10, max: 10000 }),
  body('rewardAmount').optional().isDecimal({ decimal_digits: '0,2' }),
  body('guidelines').optional().isString(),
  // Entry tier validation
  body('entryTier').optional().isIn(['FREE', 'COIN_ENTRY', 'EXCLUSIVE', 'CREATOR_TOKEN']),
  body('entryFee').optional().isDecimal({ decimal_digits: '0,2' }).custom((value, { req }) => {
    if (req.body.entryTier === 'COIN_ENTRY') {
      const fee = Number(value);
      if (!value || fee < 20 || fee > 100) {
        throw new Error('Entry fee must be between 20 and 100 coins for COIN_ENTRY tier');
      }
    }
    return true;
  }),
  body('exclusiveType').optional().isIn(['CLUB_MEMBER', 'PREMIUM_USER', 'BOTH']),
  body('requiredTokenId').optional().isString(),
  body('platformCommission').optional().isDecimal({ decimal_digits: '0,4' })
];

const submitEntryValidation = [
  body('title').optional().isString().isLength({ max: 200 }),
  body('content').isString().isLength({ min: 1, max: 50000 }),
  body('mediaUrl').optional().isURL(),
  body('mediaType').optional().isIn(['image', 'video'])
];

const selectWinnersValidation = [
  body('winnerIds').isArray({ min: 1 }),
  body('winnerIds.*').isString()
];

// ==================== CHALLENGE CRUD ====================

// Create a new challenge (Club Owner/Admin only)
router.post('/', authenticate, createChallengeValidation, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const {
      clubId, title, description, type, submissionEnd, votingEnd,
      maxWinners, wordLimit, rewardAmount, guidelines,
      entryTier, entryFee, exclusiveType, requiredTokenId, platformCommission
    } = req.body;
    const userId = req.user!.id;

    // Check if user is club owner or admin
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only club owners and admins can create challenges' }
      });
    }

    // Validate CREATOR_TOKEN tier has valid token
    if (entryTier === 'CREATOR_TOKEN' && requiredTokenId) {
      const token = await prisma.creatorToken.findUnique({
        where: { id: requiredTokenId }
      });
      if (!token || !token.isActive) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid or inactive creator token' }
        });
      }
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        clubId,
        creatorId: userId,
        title,
        description,
        type,
        submissionEnd: new Date(submissionEnd),
        votingEnd: votingEnd ? new Date(votingEnd) : null,
        maxWinners: maxWinners || 1,
        wordLimit: type === 'THEME_MICRO' ? (wordLimit || 30) : wordLimit,
        rewardAmount: rewardAmount || 50,
        guidelines,
        status: 'DRAFT',
        // Entry tier fields
        entryTier: entryTier || 'FREE',
        entryFee: entryTier === 'COIN_ENTRY' ? entryFee : null,
        prizePool: 0,
        platformCommission: platformCommission || 0.30,
        exclusiveType: entryTier === 'EXCLUSIVE' ? exclusiveType : null,
        requiredTokenId: entryTier === 'CREATOR_TOKEN' ? requiredTokenId : null
      },
      include: {
        club: { select: { id: true, name: true } },
        creator: { select: { id: true, displayName: true, avatar: true } },
        requiredToken: { select: { id: true, name: true, symbol: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// List challenges with filters
router.get('/', async (req: any, res: any) => {
  try {
    const { clubId, status, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (clubId) where.clubId = clubId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          club: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, displayName: true, avatar: true } },
          _count: { select: { entries: true } }
        }
      }),
      prisma.challenge.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        items: challenges,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('List challenges error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Get challenge by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        club: { select: { id: true, name: true, avatar: true, banner: true } },
        creator: { select: { id: true, displayName: true, avatar: true } },
        entries: {
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { voteCount: 'desc' }],
          take: 10,
          include: {
            user: { select: { id: true, displayName: true, avatar: true } }
          }
        },
        _count: { select: { entries: true } }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Update challenge (Creator only)
router.put('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the creator can update this challenge' }
      });
    }

    // Can only update DRAFT challenges fully
    if (challenge.status !== 'DRAFT') {
      const allowedFields = ['guidelines', 'votingEnd'];
      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Can only update guidelines and votingEnd for non-draft challenges' }
        });
      }

      const updated = await prisma.challenge.update({
        where: { id },
        data: updateData
      });

      return res.json({ success: true, data: updated });
    }

    const { title, description, type, submissionEnd, votingEnd, maxWinners, wordLimit, rewardAmount, guidelines, thumbnail } = req.body;

    const updated = await prisma.challenge.update({
      where: { id },
      data: {
        title,
        description,
        type,
        submissionEnd: submissionEnd ? new Date(submissionEnd) : undefined,
        votingEnd: votingEnd ? new Date(votingEnd) : null,
        maxWinners,
        wordLimit,
        rewardAmount,
        guidelines,
        thumbnail
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Delete challenge (Creator only, DRAFT status only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the creator can delete this challenge' }
      });
    }

    if (challenge.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { message: 'Can only delete challenges in DRAFT status' }
      });
    }

    await prisma.challenge.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// ==================== STATUS TRANSITIONS ====================

// Publish challenge (DRAFT -> ACTIVE)
router.post('/:id/publish', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the creator can publish this challenge' }
      });
    }

    if (challenge.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { message: 'Challenge must be in DRAFT status to publish' }
      });
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        submissionStart: new Date()
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Publish challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Start voting phase (ACTIVE -> VOTING)
router.post('/:id/start-voting', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the creator can start voting' }
      });
    }

    if (challenge.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Challenge must be ACTIVE to start voting' }
      });
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: { status: 'VOTING' }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Start voting error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Cancel challenge (DRAFT/ACTIVE -> CANCELLED)
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the creator can cancel this challenge' }
      });
    }

    if (!['DRAFT', 'ACTIVE'].includes(challenge.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Can only cancel challenges in DRAFT or ACTIVE status' }
      });
    }

    // Refund entry fees for COIN_ENTRY challenges
    let refundCount = 0;
    if (challenge.entryTier === 'COIN_ENTRY' && Number(challenge.prizePool) > 0) {
      // Get all entries with fees paid
      const paidEntries = await prisma.challengeEntry.findMany({
        where: {
          challengeId: id,
          entryFeePaid: { not: null }
        },
        include: {
          user: { include: { wallet: true } }
        }
      });

      // Process refunds
      await prisma.$transaction(async (tx) => {
        for (const entry of paidEntries) {
          if (entry.user.wallet && entry.entryFeePaid) {
            // Credit refund
            await tx.wallet.update({
              where: { id: entry.user.wallet.id },
              data: { balance: { increment: entry.entryFeePaid } }
            });

            // Create refund transaction
            await tx.transaction.create({
              data: {
                walletId: entry.user.wallet.id,
                type: 'CHALLENGE_REFUND',
                amount: entry.entryFeePaid,
                description: `Entry fee refund - Challenge cancelled: ${challenge.title}`,
                reference: id,
                metadata: {
                  challengeId: id,
                  entryId: entry.id,
                  originalFee: entry.entryFeePaid.toString()
                }
              }
            });

            refundCount++;
          }
        }

        // Update challenge status and reset prize pool
        await tx.challenge.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            prizePool: 0
          }
        });
      });
    } else {
      // Standard cancellation for non-COIN_ENTRY challenges
      await prisma.challenge.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    }

    const updated = await prisma.challenge.findUnique({ where: { id } });

    res.json({
      success: true,
      data: updated,
      message: refundCount > 0
        ? `Challenge cancelled. ${refundCount} entry fee(s) refunded.`
        : 'Challenge cancelled successfully.'
    });
  } catch (error) {
    console.error('Cancel challenge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// ==================== ENTRY TIER HELPERS ====================

// Verify entry eligibility based on challenge entry tier
async function verifyEntryEligibility(
  challenge: any,
  userId: string
): Promise<{ eligible: boolean; reason?: string }> {
  switch (challenge.entryTier) {
    case 'FREE':
      return { eligible: true };

    case 'COIN_ENTRY':
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || Number(wallet.balance) < Number(challenge.entryFee)) {
        return {
          eligible: false,
          reason: `Insufficient balance. Entry fee is ${challenge.entryFee} coins.`
        };
      }
      return { eligible: true };

    case 'EXCLUSIVE':
      const exclusiveType = challenge.exclusiveType || 'CLUB_MEMBER';
      const isClubMember = await prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId: challenge.clubId, userId: userId } }
      }) !== null;
      const hasPremium = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          type: { in: ['PREMIUM', 'VIP'] },
          endDate: { gte: new Date() }
        }
      }) !== null;

      if (exclusiveType === 'CLUB_MEMBER' && !isClubMember) {
        return { eligible: false, reason: 'This challenge is exclusive to club members.' };
      }
      if (exclusiveType === 'PREMIUM_USER' && !hasPremium) {
        return { eligible: false, reason: 'This challenge requires a Premium or VIP subscription.' };
      }
      if (exclusiveType === 'BOTH' && !isClubMember && !hasPremium) {
        return { eligible: false, reason: 'This challenge requires club membership OR Premium/VIP subscription.' };
      }
      return { eligible: true };

    case 'CREATOR_TOKEN':
      if (!challenge.requiredTokenId) {
        return { eligible: false, reason: 'Challenge token not configured.' };
      }
      const tokenHolding = await prisma.tokenHolder.findUnique({
        where: { tokenId_userId: { tokenId: challenge.requiredTokenId, userId } }
      });
      if (!tokenHolding || Number(tokenHolding.balance) <= 0) {
        return {
          eligible: false,
          reason: `You must hold creator tokens to enter this challenge.`
        };
      }
      return { eligible: true };

    default:
      return { eligible: false, reason: 'Unknown entry tier.' };
  }
}

// Process entry fee for COIN_ENTRY challenges
async function processEntryFee(
  userId: string,
  challenge: any
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    return { success: false, error: 'Wallet not found' };
  }

  if (Number(wallet.balance) < Number(challenge.entryFee)) {
    return { success: false, error: `Insufficient balance. You need ${challenge.entryFee} coins.` };
  }

  const transaction = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: challenge.entryFee } }
    });

    const txRecord = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'CHALLENGE_ENTRY_FEE',
        amount: challenge.entryFee,
        description: `Entry fee for challenge: ${challenge.title}`,
        reference: challenge.id,
        metadata: {
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          entryTier: challenge.entryTier
        }
      }
    });

    return txRecord;
  });

  return { success: true, transactionId: transaction.id };
}

// ==================== ENTRY MANAGEMENT ====================

// Submit entry to challenge
router.post('/:id/entries', authenticate, submitEntryValidation, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { id: challengeId } = req.params;
    const userId = req.user!.id;
    const { title, content, mediaUrl, mediaType } = req.body;

    // Get challenge with token info
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { requiredToken: true }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    // Check challenge is active
    if (challenge.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Challenge is not accepting submissions' }
      });
    }

    // Check deadline
    if (new Date() > challenge.submissionEnd) {
      return res.status(400).json({
        success: false,
        error: { message: 'Submission deadline has passed' }
      });
    }

    // Check user is club member (required for all tiers except EXCLUSIVE with PREMIUM_USER only)
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: challenge.clubId, userId } }
    });

    if (!membership && !(challenge.entryTier === 'EXCLUSIVE' && challenge.exclusiveType === 'PREMIUM_USER')) {
      return res.status(403).json({
        success: false,
        error: { message: 'Must be a club member to submit entries' }
      });
    }

    // Check entry tier eligibility
    const eligibility = await verifyEntryEligibility(challenge, userId);
    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        error: { message: eligibility.reason }
      });
    }

    // Check word limit
    if (challenge.wordLimit) {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > challenge.wordLimit) {
        return res.status(400).json({
          success: false,
          error: { message: `Content exceeds ${challenge.wordLimit} word limit (${wordCount} words)` }
        });
      }
    }

    // Check if user already submitted
    const existingEntry = await prisma.challengeEntry.findUnique({
      where: { challengeId_userId: { challengeId, userId } }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already submitted an entry to this challenge' }
      });
    }

    // Process entry fee for COIN_ENTRY tier
    let feeTransactionId: string | null = null;
    let entryFeePaid: any = null;

    if (challenge.entryTier === 'COIN_ENTRY' && challenge.entryFee) {
      const feeResult = await processEntryFee(userId, challenge);
      if (!feeResult.success) {
        return res.status(400).json({
          success: false,
          error: { message: feeResult.error }
        });
      }
      feeTransactionId = feeResult.transactionId || null;
      entryFeePaid = challenge.entryFee;
    }

    // Create entry and update challenge
    const [entry] = await prisma.$transaction([
      prisma.challengeEntry.create({
        data: {
          challengeId,
          userId,
          title,
          content,
          mediaUrl,
          mediaType,
          entryFeePaid,
          feeTransactionId
        },
        include: {
          user: { select: { id: true, displayName: true, avatar: true } }
        }
      }),
      prisma.challenge.update({
        where: { id: challengeId },
        data: {
          entryCount: { increment: 1 },
          ...(challenge.entryTier === 'COIN_ENTRY' && challenge.entryFee && {
            prizePool: { increment: challenge.entryFee }
          })
        }
      })
    ]);

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already submitted an entry to this challenge' }
      });
    }
    console.error('Submit entry error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// List entries for a challenge
router.get('/:id/entries', async (req: any, res: any) => {
  try {
    const { id: challengeId } = req.params;
    const { page = 1, limit = 20, sort = 'votes' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orderBy = sort === 'newest'
      ? { createdAt: 'desc' as const }
      : sort === 'featured'
        ? [{ isFeatured: 'desc' as const }, { voteCount: 'desc' as const }]
        : { voteCount: 'desc' as const };

    const [entries, total] = await Promise.all([
      prisma.challengeEntry.findMany({
        where: { challengeId, isActive: true },
        skip,
        take: Number(limit),
        orderBy,
        include: {
          user: { select: { id: true, displayName: true, avatar: true } },
          _count: { select: { votes: true } }
        }
      }),
      prisma.challengeEntry.count({ where: { challengeId, isActive: true } })
    ]);

    res.json({
      success: true,
      data: {
        items: entries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('List entries error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Get single entry
router.get('/:id/entries/:entryId', async (req: any, res: any) => {
  try {
    const { entryId } = req.params;

    const entry = await prisma.challengeEntry.findUnique({
      where: { id: entryId },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
        challenge: { select: { id: true, title: true, status: true } },
        _count: { select: { votes: true } }
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Entry not found' }
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Update own entry
router.put('/:id/entries/:entryId', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId, entryId } = req.params;
    const userId = req.user!.id;

    const entry = await prisma.challengeEntry.findUnique({
      where: { id: entryId },
      include: { challenge: true }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Entry not found' }
      });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only update your own entry' }
      });
    }

    if (entry.challenge.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Can only update entries while challenge is active' }
      });
    }

    const { title, content, mediaUrl, mediaType } = req.body;

    // Check word limit
    if (entry.challenge.wordLimit && content) {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > entry.challenge.wordLimit) {
        return res.status(400).json({
          success: false,
          error: { message: `Content exceeds ${entry.challenge.wordLimit} word limit` }
        });
      }
    }

    const updated = await prisma.challengeEntry.update({
      where: { id: entryId },
      data: { title, content, mediaUrl, mediaType }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Delete own entry
router.delete('/:id/entries/:entryId', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId, entryId } = req.params;
    const userId = req.user!.id;

    const entry = await prisma.challengeEntry.findUnique({
      where: { id: entryId },
      include: { challenge: true }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Entry not found' }
      });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only delete your own entry' }
      });
    }

    if (entry.challenge.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete entries from completed challenges' }
      });
    }

    await prisma.$transaction([
      prisma.challengeEntry.delete({ where: { id: entryId } }),
      prisma.challenge.update({
        where: { id: challengeId },
        data: { entryCount: { decrement: 1 } }
      })
    ]);

    res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// ==================== VOTING ====================

// Vote for an entry
router.post('/:id/entries/:entryId/vote', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId, entryId } = req.params;
    const voterId = req.user!.id;

    // Get challenge and entry
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    const entry = await prisma.challengeEntry.findUnique({ where: { id: entryId } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Entry not found' }
      });
    }

    // Check challenge is in voting phase
    if (challenge.status !== 'VOTING') {
      return res.status(400).json({
        success: false,
        error: { message: 'Voting is not open for this challenge' }
      });
    }

    // Check voting deadline
    if (challenge.votingEnd && new Date() > challenge.votingEnd) {
      return res.status(400).json({
        success: false,
        error: { message: 'Voting period has ended' }
      });
    }

    // Check voter is club member
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: challenge.clubId, userId: voterId } }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { message: 'Must be a club member to vote' }
      });
    }

    // Prevent self-voting
    if (entry.userId === voterId) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot vote for your own entry' }
      });
    }

    // Create vote and increment counters
    const [vote] = await prisma.$transaction([
      prisma.challengeVote.create({
        data: { entryId, voterId }
      }),
      prisma.challengeEntry.update({
        where: { id: entryId },
        data: { voteCount: { increment: 1 } }
      }),
      prisma.challenge.update({
        where: { id: challengeId },
        data: { voteCount: { increment: 1 } }
      })
    ]);

    res.status(201).json({
      success: true,
      data: vote
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already voted for this entry' }
      });
    }
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Remove vote
router.delete('/:id/entries/:entryId/vote', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId, entryId } = req.params;
    const voterId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });

    if (!challenge || challenge.status !== 'VOTING') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot remove vote - voting not active' }
      });
    }

    const vote = await prisma.challengeVote.findUnique({
      where: { entryId_voterId: { entryId, voterId } }
    });

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vote not found' }
      });
    }

    await prisma.$transaction([
      prisma.challengeVote.delete({
        where: { entryId_voterId: { entryId, voterId } }
      }),
      prisma.challengeEntry.update({
        where: { id: entryId },
        data: { voteCount: { decrement: 1 } }
      }),
      prisma.challenge.update({
        where: { id: challengeId },
        data: { voteCount: { decrement: 1 } }
      })
    ]);

    res.json({
      success: true,
      message: 'Vote removed successfully'
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Get user's votes for a challenge
router.get('/:id/votes/my', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId } = req.params;
    const voterId = req.user!.id;

    const votes = await prisma.challengeVote.findMany({
      where: {
        voterId,
        entry: { challengeId }
      },
      include: {
        entry: { select: { id: true, title: true } }
      }
    });

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Get my votes error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// ==================== CREATOR ACTIONS ====================

// Feature/unfeature an entry
router.post('/:id/entries/:entryId/feature', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id: challengeId, entryId } = req.params;
    const userId = req.user!.id;
    const { featured = true } = req.body;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the challenge creator can feature entries' }
      });
    }

    const entry = await prisma.challengeEntry.update({
      where: { id: entryId },
      data: { isFeatured: featured }
    });

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Feature entry error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Select winners and distribute rewards
router.post('/:id/winners', authenticate, selectWinnersValidation, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { id: challengeId } = req.params;
    const userId = req.user!.id;
    const { winnerIds } = req.body;

    // Get challenge with entries
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { entries: true }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
    }

    if (challenge.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the challenge creator can select winners' }
      });
    }

    if (challenge.status !== 'VOTING') {
      return res.status(400).json({
        success: false,
        error: { message: 'Challenge must be in VOTING status to select winners' }
      });
    }

    if (winnerIds.length > challenge.maxWinners) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot select more than ${challenge.maxWinners} winners` }
      });
    }

    // Validate all winner IDs
    const validEntryIds = challenge.entries.map(e => e.id);
    const invalidIds = winnerIds.filter((id: string) => !validEntryIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid entry IDs provided' }
      });
    }

    // Get winner entries with user wallets
    const winnerEntries = await prisma.challengeEntry.findMany({
      where: { id: { in: winnerIds } },
      include: { user: { include: { wallet: true } } }
    });

    // Calculate prize amount based on entry tier
    let prizePerWinner: number;
    let transactionType: string;

    if (challenge.entryTier === 'COIN_ENTRY' && Number(challenge.prizePool) > 0) {
      // Prize from pool minus platform commission
      const poolAmount = Number(challenge.prizePool);
      const commission = poolAmount * Number(challenge.platformCommission);
      const distributablePrize = poolAmount - commission;
      prizePerWinner = distributablePrize / winnerIds.length;
      transactionType = 'CHALLENGE_PRIZE_PAYOUT';
    } else {
      // Fixed reward for FREE/EXCLUSIVE/CREATOR_TOKEN tiers
      prizePerWinner = Number(challenge.rewardAmount);
      transactionType = 'CHALLENGE_REWARD';
    }

    // Execute winner marking and reward distribution
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < winnerIds.length; i++) {
        const entryId = winnerIds[i];
        const rank = i + 1;

        // Mark as winner
        await tx.challengeEntry.update({
          where: { id: entryId },
          data: { isWinner: true, winnerRank: rank }
        });

        // Get winner's wallet
        const entry = winnerEntries.find(e => e.id === entryId);
        const wallet = entry?.user.wallet;

        if (wallet) {
          // Credit reward to winner's wallet
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: prizePerWinner } }
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: transactionType as any,
              amount: prizePerWinner,
              description: `Challenge ${challenge.entryTier === 'COIN_ENTRY' ? 'prize' : 'reward'}: ${challenge.title} (Rank #${rank})`,
              reference: challengeId,
              metadata: {
                challengeId,
                entryId,
                rank,
                challengeTitle: challenge.title,
                entryTier: challenge.entryTier,
                prizePool: challenge.prizePool?.toString()
              }
            }
          });
        }
      }

      // Update challenge status to COMPLETED
      await tx.challenge.update({
        where: { id: challengeId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    });

    // Get updated challenge with winners
    const completedChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        entries: {
          where: { isWinner: true },
          orderBy: { winnerRank: 'asc' },
          include: {
            user: { select: { id: true, displayName: true, avatar: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: `${winnerIds.length} winner(s) selected and rewarded with ${prizePerWinner.toFixed(2)} coins each`,
      data: completedChallenge
    });
  } catch (error) {
    console.error('Select winners error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

export default router;

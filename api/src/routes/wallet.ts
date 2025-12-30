import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Get wallet balance
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          rewardsBalance: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: wallet.id,
        balance: parseFloat(wallet.balance.toString()),
        rewardsBalance: parseFloat(wallet.rewardsBalance.toString()),
        totalBalance: parseFloat(wallet.balance.toString()) + parseFloat(wallet.rewardsBalance.toString()),
        currency: wallet.currency
      }
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch wallet balance' }
    });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const skip = (page - 1) * limit;

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    const where: any = { walletId: wallet.id };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: transactions.map(t => ({
        ...t,
        amount: parseFloat(t.amount.toString())
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch transactions' }
    });
  }
});

// Top up wallet (mock for demo - no real payment)
router.post('/topup', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid amount' }
      });
    }

    // For demo: max top-up of $1000
    if (amount > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum top-up amount is $1000' }
      });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          rewardsBalance: 0
        }
      });
    }

    // Update wallet and create transaction in a single transaction
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount
          }
        }
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          description: 'Wallet top-up (Demo)',
          reference: `TOPUP_${Date.now()}`
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        wallet: {
          id: updatedWallet.id,
          balance: parseFloat(updatedWallet.balance.toString()),
          rewardsBalance: parseFloat(updatedWallet.rewardsBalance.toString()),
          currency: updatedWallet.currency
        },
        transaction: {
          ...transaction,
          amount: parseFloat(transaction.amount.toString())
        }
      },
      message: 'Top-up successful (Demo mode - no actual payment processed)'
    });
  } catch (error) {
    console.error('Error topping up wallet:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to top up wallet' }
    });
  }
});

// Get rewards balance only
router.get('/rewards', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        rewardsBalance: wallet ? parseFloat(wallet.rewardsBalance.toString()) : 0,
        currency: wallet?.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch rewards balance' }
    });
  }
});

// Transfer from rewards to main balance
router.post('/transfer-rewards', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid amount' }
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wallet not found' }
      });
    }

    if (parseFloat(wallet.rewardsBalance.toString()) < amount) {
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient rewards balance' }
      });
    }

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          rewardsBalance: { decrement: amount },
          balance: { increment: amount }
        }
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          description: 'Transfer from rewards',
          reference: `REWARDS_TRANSFER_${Date.now()}`
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        wallet: {
          id: updatedWallet.id,
          balance: parseFloat(updatedWallet.balance.toString()),
          rewardsBalance: parseFloat(updatedWallet.rewardsBalance.toString()),
          currency: updatedWallet.currency
        },
        transaction: {
          ...transaction,
          amount: parseFloat(transaction.amount.toString())
        }
      },
      message: 'Transfer successful'
    });
  } catch (error) {
    console.error('Error transferring rewards:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to transfer rewards' }
    });
  }
});

export default router;

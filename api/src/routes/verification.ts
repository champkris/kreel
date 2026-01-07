import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Get current user's verification status
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get or create verification record
    let verification = await prisma.professionalVerification.findUnique({
      where: { userId }
    });

    if (!verification) {
      // Check if user is professional type
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true }
      });

      if (user?.userType !== 'PROFESSIONAL') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only professional accounts can access verification' }
        });
      }

      // Create initial verification record
      verification = await prisma.professionalVerification.create({
        data: {
          userId,
          status: 'NOT_STARTED'
        }
      });
    }

    res.json({
      success: true,
      data: {
        status: verification.status,
        identity: {
          submitted: !!verification.idDocumentUrl,
          type: verification.idType,
          verifiedAt: verification.idVerifiedAt
        },
        address: {
          submitted: !!verification.addressDocUrl,
          type: verification.addressDocType,
          verifiedAt: verification.addressVerifiedAt
        },
        payment: {
          submitted: !!verification.payoutMethod,
          method: verification.payoutMethod,
          verifiedAt: verification.paymentVerifiedAt
        },
        rejectionReason: verification.rejectionReason,
        submittedAt: verification.submittedAt,
        reviewedAt: verification.reviewedAt
      }
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch verification status' }
    });
  }
});

// Submit identity verification (Step 1)
router.post('/identity', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { idType, idDocumentUrl } = req.body;

    if (!idType || !idDocumentUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'ID type and document are required' }
      });
    }

    const validIdTypes = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE'];
    if (!validIdTypes.includes(idType)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid ID type' }
      });
    }

    // Upsert verification record
    const verification = await prisma.professionalVerification.upsert({
      where: { userId },
      update: {
        idType,
        idDocumentUrl,
        status: 'IDENTITY_SUBMITTED'
      },
      create: {
        userId,
        idType,
        idDocumentUrl,
        status: 'IDENTITY_SUBMITTED'
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Identity verification submitted',
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Error submitting identity verification:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit identity verification' }
    });
  }
});

// Submit address verification (Step 2)
router.post('/address', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { addressDocType, addressDocUrl } = req.body;

    if (!addressDocType || !addressDocUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Document type and document are required' }
      });
    }

    const validDocTypes = ['UTILITY_BILL', 'PHONE_BILL', 'BANK_STATEMENT'];
    if (!validDocTypes.includes(addressDocType)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid document type' }
      });
    }

    // Check that identity was submitted first
    const existing = await prisma.professionalVerification.findUnique({
      where: { userId }
    });

    if (!existing || !existing.idDocumentUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please complete identity verification first' }
      });
    }

    const verification = await prisma.professionalVerification.update({
      where: { userId },
      data: {
        addressDocType,
        addressDocUrl,
        status: 'ADDRESS_SUBMITTED'
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Address verification submitted',
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Error submitting address verification:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit address verification' }
    });
  }
});

// Submit payment information (Step 3)
router.post('/payment', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      payoutMethod,
      bankAccountName,
      bankName,
      bankAccountNumber,
      paypalEmail,
      stripeEmail
    } = req.body;

    if (!payoutMethod) {
      return res.status(400).json({
        success: false,
        error: { message: 'Payout method is required' }
      });
    }

    const validMethods = ['BANK_TRANSFER', 'PAYPAL', 'STRIPE'];
    if (!validMethods.includes(payoutMethod)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payout method' }
      });
    }

    // Validate required fields based on method
    if (payoutMethod === 'BANK_TRANSFER') {
      if (!bankAccountName || !bankName || !bankAccountNumber) {
        return res.status(400).json({
          success: false,
          error: { message: 'Bank account details are required for bank transfer' }
        });
      }
    } else if (payoutMethod === 'PAYPAL' && !paypalEmail) {
      return res.status(400).json({
        success: false,
        error: { message: 'PayPal email is required' }
      });
    } else if (payoutMethod === 'STRIPE' && !stripeEmail) {
      return res.status(400).json({
        success: false,
        error: { message: 'Stripe email is required' }
      });
    }

    // Check that address was submitted first
    const existing = await prisma.professionalVerification.findUnique({
      where: { userId }
    });

    if (!existing || !existing.addressDocUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please complete address verification first' }
      });
    }

    const verification = await prisma.professionalVerification.update({
      where: { userId },
      data: {
        payoutMethod,
        bankAccountName: payoutMethod === 'BANK_TRANSFER' ? bankAccountName : null,
        bankName: payoutMethod === 'BANK_TRANSFER' ? bankName : null,
        bankAccountNumber: payoutMethod === 'BANK_TRANSFER' ? bankAccountNumber : null,
        paypalEmail: payoutMethod === 'PAYPAL' ? paypalEmail : null,
        stripeEmail: payoutMethod === 'STRIPE' ? stripeEmail : null,
        status: 'PAYMENT_SUBMITTED'
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Payment information submitted',
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Error submitting payment info:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit payment information' }
    });
  }
});

// Submit for final review
router.post('/submit', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const existing = await prisma.professionalVerification.findUnique({
      where: { userId }
    });

    if (!existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'No verification record found' }
      });
    }

    // Check all steps are complete
    if (!existing.idDocumentUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Identity verification not complete' }
      });
    }

    if (!existing.addressDocUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Address verification not complete' }
      });
    }

    if (!existing.payoutMethod) {
      return res.status(400).json({
        success: false,
        error: { message: 'Payment information not complete' }
      });
    }

    const verification = await prisma.professionalVerification.update({
      where: { userId },
      data: {
        status: 'UNDER_REVIEW',
        submittedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Verification submitted for review',
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Error submitting for review:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit for review' }
    });
  }
});

// Update business information (optional)
router.post('/business', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { businessName, businessRegNumber, taxId } = req.body;

    const verification = await prisma.professionalVerification.upsert({
      where: { userId },
      update: {
        businessName,
        businessRegNumber,
        taxId
      },
      create: {
        userId,
        businessName,
        businessRegNumber,
        taxId,
        status: 'NOT_STARTED'
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Business information updated',
        businessName: verification.businessName,
        businessRegNumber: verification.businessRegNumber,
        taxId: verification.taxId
      }
    });
  } catch (error) {
    console.error('Error updating business info:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update business information' }
    });
  }
});

export default router;

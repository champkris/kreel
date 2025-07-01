import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint - coming soon'
  });
});

export default router;

import { Router } from 'express';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Test endpoint to verify that the ID token is successfully validated by the middleware
router.get('/me', verifyToken, (req, res) => {
  // If the code reaches here, req.user is guaranteed to exist and be valid
  res.json({
    status: 'success',
    message: 'Authentication successful',
    user: req.user
  });
});

export default router;

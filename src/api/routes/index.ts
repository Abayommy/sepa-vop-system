import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { validateVerificationRequest } from '../middleware/validation';

const router = Router();

router.post('/verify', validateVerificationRequest, verificationController.verify.bind(verificationController));
router.get('/', (_req, res) => {
  res.json({
    name: 'SEPA VoP API',
    version: '1.0.0',
    endpoints: { verify: 'POST /api/v1/verify', health: 'GET /health', ready: 'GET /ready' }
  });
});

export default router;

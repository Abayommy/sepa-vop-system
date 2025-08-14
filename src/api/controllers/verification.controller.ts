import { Request, Response, NextFunction } from 'express';
import { VerificationEngine } from '../../core/verification-engine';

const verificationEngine = new VerificationEngine();

export class VerificationController {
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { iban, payeeName, requestId } = req.body;
      const result = await verificationEngine.verify({ iban, payeeName, requestId });
      res.status(200).json(result);
    } catch (e) { next(e as Error); }
  }
}
export const verificationController = new VerificationController();

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const schema = Joi.object({
  iban: Joi.string().pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/).min(15).max(34).required(),
  payeeName: Joi.string().max(140).required(),
  requestId: Joi.string().uuid().optional(),
});

export const validateVerificationRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = schema.validate(req.body);
  if (error) { res.status(400).json({ error: 'Validation Error', details: error.details.map(d => d.message) }); return; }
  next();
};

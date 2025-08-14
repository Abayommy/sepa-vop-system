import { v4 as uuidv4 } from 'uuid';
import { nameMatcher } from '../matching-algorithms/name-matcher';
import { database } from '../../services/database';
import { cache } from '../../services/cache';

export interface VerificationRequest {
  iban: string;
  payeeName: string;
  requestId?: string;
  timestamp?: Date;
}

export interface VerificationResult {
  requestId: string;
  matchResult: 'MATCH' | 'CLOSE_MATCH' | 'NO_MATCH' | 'UNAVAILABLE';
  matchScore: number;
  processingTime: number;
  timestamp: Date;
}

export class VerificationEngine {
  private validateIBAN(iban: string): boolean {
    const re = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    return re.test(iban) && iban.length >= 15 && iban.length <= 34;
  }

  private outcome(score: number): VerificationResult['matchResult'] {
    if (score >= 95) return 'MATCH';
    if (score >= 80) return 'CLOSE_MATCH';
    if (score >= 0) return 'NO_MATCH';
    return 'UNAVAILABLE';
  }

  async verify(req: VerificationRequest): Promise<VerificationResult> {
    const start = Date.now();
    const requestId = req.requestId || uuidv4();
    const ts = req.timestamp || new Date();

    if (!this.validateIBAN(req.iban)) {
      throw new Error('Invalid IBAN format');
    }

    // read from cache/db
    const cacheKey = `vop:${req.iban}`;
    let name = await cache.get(cacheKey);
    if (!name) {
      name = await database.getAccountHolder(req.iban);
      if (!name) {
        return {
          requestId,
          matchResult: 'UNAVAILABLE',
          matchScore: -1,
          processingTime: Date.now() - start,
          timestamp: new Date(),
        };
      }
      await cache.set(cacheKey, name, 300); // 5 minutes
    }

    // score + outcome
    const score = await nameMatcher.match(req.payeeName, name);
    const result = this.outcome(score);
    const ms = Date.now() - start;

    // audit log
    await database.logVerification({
      request_id: requestId,
      iban: req.iban,
      provided_name: req.payeeName,
      match_result: result,
      match_score: score,
      processing_time_ms: ms,
      request_timestamp: ts,
      response_timestamp: new Date(),
    });

    return {
      requestId,
      matchResult: result,
      matchScore: score,
      processingTime: ms,
      timestamp: new Date(),
    };
  }
}

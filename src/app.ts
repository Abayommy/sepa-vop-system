// src/app.ts

import { cache } from './services/cache';

import express, {
  Application,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// If you have a config module, keep this import. If not, you can remove it.
import config from './config';

const app: Application = express();

/** Core middleware */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());
app.use(morgan('combined'));

/** Basic rate limiter */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/** Simple test route (optional) */
app.get('/test', (_req: Request, res: Response) => {
  res.status(200).send('ok');
});

/** Health/ready probes */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

/** Redis connectivity probe */
app.get('/redis-ping', async (_req: Request, res: Response) => {
  try {
    const pong = await cache.ping(); // returns "PONG" when OK
    res.status(200).json({
      status: 'ok',
      redis: pong,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Redis connection failed',
      error: err?.message,
    });
  }
});

/** Attach API routes here if/when you have them */
// import apiRoutes from './api';
// app.use('/api', apiRoutes);

/** Error handler (keep last) */
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: config?.app?.env === 'development' ? err.message : undefined,
    });
  }
);

export default app;

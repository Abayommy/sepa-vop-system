import cache from './services/cache';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import apiRoutes from './api/routes';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  if (config.app.env !== 'test') {
    app.use(morgan('combined'));
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/ready', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  });
  
  app.get('/redis-ping', async (req: Request, res: Response) => {
  try {
    const pong = await cache.healthCheck(); // this runs Redis PING
    res.status(200).json({
      status: 'ok',
      redis: pong,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Redis connection failed',
      error: (err as Error).message,
    });
  }
});

  // API routes will be attached later
  app.use(`/api/${config.app.apiVersion}`, apiRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.app.env === 'development' ? err.message : undefined,
    });
  });

  return app;
};

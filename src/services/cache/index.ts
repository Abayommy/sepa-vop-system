// src/services/cache/index.ts
import Redis, { Redis as RedisClient } from 'ioredis';
import { config } from '../../config';

/**
 * Central Redis/Valkey cache service.
 * Uses environment/config values and exposes simple helpers + a health check.
 */
export class CacheService {
  private client: RedisClient;

  constructor() {
    const host =
      config.redis?.host || process.env.REDIS_HOST || '127.0.0.1';
    const port =
      Number(config.redis?.port ?? process.env.REDIS_PORT ?? 6379);
    const password =
      config.redis?.password || process.env.REDIS_PASSWORD || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      // Recommended settings for managed Redis/Valkey on Render
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('error', (err) => {
      console.error('[Redis] error:', err);
    });

    this.client.on('connect', () => {
      console.log(`[Redis] connected to ${host}:${port}`);
    });
  }

  /** Get a key's value */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Set a key's value, optionally with TTL (seconds) */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl && ttl > 0) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  /** Delete a key */
  async deleteKey(key: string): Promise<void> {
    await this.client.del(key);
  }

  /** Low-latency liveness probe; resolves true on PONG */
  async healthCheck(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  /** Raw PING (returns 'PONG' or throws) */
  async ping(): Promise<string> {
    return this.client.ping();
  }

  /** Graceful shutdown */
  async close(): Promise<void> {
    await this.client.quit();
  }
}

/** Singleton instance exported as a named export */
export const cache = new CacheService();

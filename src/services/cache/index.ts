import Redis from 'ioredis';
import { config } from '../../config';

export class CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (t) => Math.min(t * 50, 2000),
    });
    this.client.on('error', (e) => console.error('Redis error:', e));
    this.client.on('connect', () => console.log('✅ Connected to Redis'));
  }

  async get(key: string) { return this.client.get(key); }
  async set(key: string, value: string, ttl?: number) {
    if (ttl) await this.client.set(key, value, 'EX', ttl); else await this.client.set(key, value);
  }
  async delete(key: string) { await this.client.del(key); }
  async healthCheck() { try { return (await this.client.ping()) === 'PONG'; } catch { return false; } }
  async close() { await this.client.quit(); }
}
export const cache = new CacheService();

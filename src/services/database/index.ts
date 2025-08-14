import knex, { Knex } from 'knex';
import { config } from '../../config';

export class DatabaseService {
  private db: Knex;

  constructor() {
    this.db = knex({
      client: 'pg',
      connection: {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
      },
      pool: { min: config.database.pool.min, max: config.database.pool.max },
    });
  }

  async getAccountHolder(iban: string): Promise<string | null> {
    const result = await this.db('vop.account_holders')
      .where({ iban, is_active: true })
      .select('account_holder_name')
      .first();
    return result?.account_holder_name || null;
  }

  async logVerification(data: any): Promise<void> {
    await this.db('vop.verification_logs').insert(data);
  }

  async healthCheck(): Promise<boolean> {
    try { await this.db.raw('SELECT 1'); return true; } catch { return false; }
  }

  async close(): Promise<void> { await this.db.destroy(); }
}
export const database = new DatabaseService();

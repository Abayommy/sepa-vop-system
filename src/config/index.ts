import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'sepa_vop',
    user: process.env.DB_USER || 'vop_user',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    apiKeySalt: process.env.API_KEY_SALT || 'change-this-salt',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  monitoring: {
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  },
  compliance: {
    auditLogEnabled: process.env.AUDIT_LOG_ENABLED === 'true',
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555', 10),
  },
};

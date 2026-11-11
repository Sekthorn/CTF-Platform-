export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'websec_ctf_super_secret_jwt_key_2026_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'websec_ctf_super_secret_refresh_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'redis_password',
  },
  setupSecret:
    process.env.SETUP_SECRET ||
    'websec_admin_initial_setup_secret_2026_change_in_prod',
  cookie: {
    domain: process.env.COOKIE_DOMAIN,
    secure:
      process.env.COOKIE_SECURE === 'true' ||
      process.env.NODE_ENV === 'production',
  },
  throttle: {
    ttl: 60000, // 60 seconds
    limit: 100, // 100 requests per minute
  },
});

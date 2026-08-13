/**
 * Production Environment Configuration Validator.
 * Asserts presence of required variables without leaking sensitive values.
 */
export function validateEnvironment(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const missing: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error(`[FATAL_STARTUP] Missing critical environment variables: ${missing.join(', ')}`);
    throw new Error('Environment validation failed: Required variables missing.');
  }

  // Safety checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'default-secret-key-change-me' || process.env.JWT_SECRET === 'dev-secret') {
      console.warn('[SECURITY_WARNING] JWT_SECRET uses a weak default key in production.');
    }
  }
}

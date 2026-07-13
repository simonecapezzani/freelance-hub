/**
 * Application environment configuration.
 */
export interface EnvConfig {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

/**
 * Reads a required environment variable or throws if missing.
 * @param key - Environment variable name
 * @returns The variable value
 */
function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Loads and validates environment variables used by the application.
 * @returns Validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const port = Number(process.env.PORT ?? 3000);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a positive number');
  }

  return {
    port,
    mongodbUri: requireEnv('MONGODB_URI'),
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  };
}

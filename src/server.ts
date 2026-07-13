import 'dotenv/config';
import app from './app.ts';
import { connectDatabase } from './config/database.ts';
import { getEnvConfig } from './config/env.ts';

/**
 * Bootstraps the application: loads config, connects to MongoDB, starts HTTP server.
 */
async function bootstrap(): Promise<void> {
  const { port, mongodbUri } = getEnvConfig();

  await connectDatabase(mongodbUri);

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.ts';

const app: Express = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes will be mounted in upcoming steps:
// app.use('/auth', authRoutes);
// app.use('/clients', clientRoutes);
// app.use('/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

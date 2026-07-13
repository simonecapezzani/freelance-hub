import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.ts';
import authRoutes from './routes/auth.routes.ts';

const app: Express = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

// Routes will be mounted in upcoming steps:
// app.use('/clients', clientRoutes);
// app.use('/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

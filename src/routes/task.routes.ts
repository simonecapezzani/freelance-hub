import { Router } from 'express';
import { updateTask } from '../controllers/task.controller.ts';
import { authenticate } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(authenticate);

router.patch('/:id', updateTask);

export default router;

import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient,
} from '../controllers/client.controller.ts';
import { authenticate } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(authenticate);

router.get('/', listClients);
router.post('/create', createClient);
router.get('/:id', getClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;

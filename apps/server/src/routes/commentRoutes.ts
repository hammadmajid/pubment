import { Router } from 'express';
import commentController from '../controllers/commentController';

const router: Router = Router();

router.post('/create', commentController.create);

export default router;

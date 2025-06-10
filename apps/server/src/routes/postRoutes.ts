import { Router, type Router as RouterType } from 'express';
import postController from '../controllers/postController.ts';

const router: RouterType = Router();

router.get('/:id', postController.getById);
router.get('/all', postController.getAll);
router.post('/create', postController.create);

export default router;

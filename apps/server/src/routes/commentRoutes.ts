import { Router } from 'express';
import commentController from '../controllers/commentController';

const router: Router = Router();

router.post('/create', commentController.create);
router.get('/post/:postId', commentController.getByPostId);
router.get('/:id', commentController.getById);

export default router;

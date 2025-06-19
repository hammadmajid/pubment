import { Router, type Router as RouterType } from 'express';
import postController from '../controllers/postController';

const router: RouterType = Router();

router.get('/', postController.getAll);
router.get('/:id', postController.getById);
router.get('/user/:username', postController.getAllByUsername);
router.post('/create', postController.create);

router.post('/:postId/like', postController.toggleLike);

export default router;

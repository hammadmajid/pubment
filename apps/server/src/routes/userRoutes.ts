import { Router, type Router as RouterType } from 'express';
import userController from '../controllers/userController';

const router: RouterType = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/:username', userController.getByUsername);

export default router;

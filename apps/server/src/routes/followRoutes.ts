import express, { type Router } from 'express';
import { authenticate } from '../middleware/auth';
import followController from '../controllers/followController';

const router: Router = express.Router();

router.post('/toggle', followController.toggleFollow);
router.get('/following/:userId', followController.getFollowing);
router.get('/followers', followController.getFollowers);

export default router;

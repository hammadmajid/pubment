import express, { type Router } from 'express';
import followController from '../controllers/followController';

const router: Router = express.Router();

router.post('/toggle', followController.toggleFollow);

router.get('/following', followController.getFollowingOfCurrentUser);
router.get('/followers', followController.getFollowersOfCurrentUser);

router.get('/following/:userId', followController.getFollowingByUserId);
router.get('/followers/:userId', followController.getFollowersByUserId);

export default router;

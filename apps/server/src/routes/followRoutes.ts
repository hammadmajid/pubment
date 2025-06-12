import express, { type Router } from 'express';
import followController from '../controllers/followController';

const router: Router = express.Router();

router.post('/toggle', followController.toggleFollow);

router.get('/following', followController.getFollowingOfCurrentUser);
router.get('/followers', followController.getFollowers);

router.get('/following/:userId', followController.getFollowing);
router.get('/followers/:userId', followController.getFollowersOfUser);

export default router;

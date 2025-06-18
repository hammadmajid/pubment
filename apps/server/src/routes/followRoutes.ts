import express, { type Router } from 'express';
import followController from '../controllers/followController';

const router: Router = express.Router();

router.post('/toggle', followController.toggleFollow);

export default router;

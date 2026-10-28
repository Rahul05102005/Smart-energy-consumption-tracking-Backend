import { Router } from 'express';
import { asyncRoute } from '../utils/request.js';
import { completeChallenge, createChallenge, deleteChallenge, listChallenges } from '../controllers/challenges.controller.js';
const router = Router();
router.route('/challenges').get(asyncRoute(listChallenges)).post(asyncRoute(createChallenge));
router.patch('/challenges/:id/complete', asyncRoute(completeChallenge));
router.delete('/challenges/:id', asyncRoute(deleteChallenge));
export default router;

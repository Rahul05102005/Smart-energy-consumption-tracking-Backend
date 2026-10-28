import { Router } from 'express';
import { asyncRoute } from '../utils/request.js';
import { listRecommendations, syncRecommendations } from '../controllers/recommendations.controller.js';
const router = Router();
router.get('/recommendations', asyncRoute(listRecommendations));
router.post('/recommendations/sync', asyncRoute(syncRecommendations));
export default router;

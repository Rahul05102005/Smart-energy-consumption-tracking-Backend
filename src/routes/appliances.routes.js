import { Router } from 'express';
import { asyncRoute } from '../utils/request.js';
import { createAppliance, deleteAppliance, listAppliances, listUsageHistory, updateAppliance } from '../controllers/appliances.controller.js';
const router = Router();
router.route('/appliances').get(asyncRoute(listAppliances)).post(asyncRoute(createAppliance));
router.route('/appliances/:id').patch(asyncRoute(updateAppliance)).delete(asyncRoute(deleteAppliance));
router.get('/usage-history', asyncRoute(listUsageHistory));
export default router;

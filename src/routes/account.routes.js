import { Router } from 'express';
import { asyncRoute } from '../utils/request.js';
import { getProfile, getSettings, updateProfile, updateSettings } from '../controllers/account.controller.js';
const router = Router();
router.get('/profile', asyncRoute(getProfile));
router.patch('/profile', asyncRoute(updateProfile));
router.get('/settings', asyncRoute(getSettings));
router.patch('/settings', asyncRoute(updateSettings));
export default router;

import express from 'express';
import { login, demoLogin, getMe, getUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);

export default router;

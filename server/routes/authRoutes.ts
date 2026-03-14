import express from 'express';
const router = express.Router();
import {
  register,
  login,
  getMe,
  changePassword,
  getAllStaff,
} from '../controllers/authController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/staff', protect, authorize('admin'), getAllStaff);

export default router;

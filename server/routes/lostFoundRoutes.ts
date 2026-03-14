import express from 'express';
const router = express.Router();
import {
  createItem,
  getAllItems,
  getMyItems,
  getItem,
  updateItemStatus,
  deleteItem,
  getLostFoundStats,
} from '../controllers/lostFoundController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

router.route('/')
  .get(getAllItems)
  .post(protect, upload.single('image'), createItem);

router.get('/my', protect, getMyItems);
router.get('/stats', protect, getLostFoundStats);

router.route('/:id')
  .get(getItem)
  .delete(protect, deleteItem);

router.put('/:id/status', protect, updateItemStatus);

export default router;

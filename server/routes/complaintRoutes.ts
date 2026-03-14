import express from 'express';
const router = express.Router();
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getAssignedComplaints,
  getComplaint,
  assignComplaint,
  updateComplaintStatus,
  getComplaintStats,
  deleteComplaint,
} from '../controllers/complaintController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';
import upload from '../middleware/upload.ts';

router.route('/')
  .post(protect, upload.single('image'), createComplaint);

router.get('/all', protect, authorize('admin'), getAllComplaints);
router.get('/my', protect, getMyComplaints);
router.get('/assigned', protect, authorize('staff'), getAssignedComplaints);
router.get('/stats', protect, getComplaintStats);

router.route('/:id')
  .get(protect, getComplaint)
  .delete(protect, authorize('admin'), deleteComplaint);

router.put('/:id/assign', protect, authorize('admin'), assignComplaint);
router.put('/:id/status', protect, authorize('staff'), updateComplaintStatus);

export default router;

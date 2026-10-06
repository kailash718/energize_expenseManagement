import express from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDepartments)
  .post(protect, authorize('admin'), createDepartment);

export default router;

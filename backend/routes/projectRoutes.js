import express from 'express';
import { getProjects, getProjectById, createProject } from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin', 'hod', 'faculty'), createProject);

router.route('/:id').get(getProjectById);

export default router;

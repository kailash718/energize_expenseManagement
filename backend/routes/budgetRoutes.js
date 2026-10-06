import express from 'express';
import { getBudgets, getDepartmentBudget, saveBudget } from '../controllers/budgetController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(authorize('admin', 'registrar', 'finance'), saveBudget);

router.get('/department/:departmentId', getDepartmentBudget);

export default router;

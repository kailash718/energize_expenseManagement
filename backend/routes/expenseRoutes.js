import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  hodReviewExpense,
  financeVerifyExpense,
  registrarApproveExpense,
  disburseExpensePayment,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(upload.single('receiptFile'), createExpense)
  .get(getExpenses);

router.route('/:id').get(getExpenseById);

// Multi-Level Approval Routes
router.put('/:id/hod-review', authorize('hod', 'admin'), hodReviewExpense);
router.put('/:id/finance-verify', authorize('finance', 'admin'), financeVerifyExpense);
router.put('/:id/registrar-approve', authorize('registrar', 'admin'), registrarApproveExpense);
router.post('/:id/disburse', authorize('finance', 'admin'), disburseExpensePayment);

export default router;

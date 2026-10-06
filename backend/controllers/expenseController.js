import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Project from '../models/Project.js';
import Reimbursement from '../models/Reimbursement.js';

// Helper to generate next sequential Expense ID (e.g. EXP-2026-00125)
const generateExpenseId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `EXP-${currentYear}-`;
  const count = await Expense.countDocuments({
    expenseId: { $regex: `^${prefix}` },
  });
  const seq = String(count + 125).padStart(5, '0');
  return `${prefix}${seq}`;
};

// @desc Submit a new university expense
// @route POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const {
      category,
      projectId,
      projectEvent,
      amount,
      date,
      purpose,
      description,
      workflowType,
    } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Valid expense amount is required' });
    }

    const employeeId = req.user._id;
    const departmentId = req.user.departmentId?._id || req.body.departmentId;

    if (!departmentId) {
      return res.status(400).json({ message: 'User is not assigned to a department' });
    }

    // Auto-generate immutable Expense ID
    const expenseId = await generateExpenseId();

    // Receipt file
    let receiptUrl = '';
    let receiptOriginalName = '';
    if (req.file) {
      receiptUrl = `/uploads/${req.file.filename}`;
      receiptOriginalName = req.file.originalname;
    } else if (req.body.receiptUrl) {
      receiptUrl = req.body.receiptUrl;
      receiptOriginalName = req.body.receiptOriginalName || 'uploaded_receipt.pdf';
    }

    // Check for potential duplicate claims (same employee, same category & amount within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const potentialDuplicate = await Expense.findOne({
      employeeId,
      category,
      amount: numAmount,
      createdAt: { $gte: sevenDaysAgo },
      status: { $ne: 'Rejected' },
    });

    let isDuplicateFlag = false;
    let duplicateDetails = '';
    if (potentialDuplicate) {
      isDuplicateFlag = true;
      duplicateDetails = `Potential duplicate of ${potentialDuplicate.expenseId} (₹${potentialDuplicate.amount} on ${new Date(potentialDuplicate.date).toLocaleDateString()})`;
    }

    const expense = new Expense({
      expenseId,
      employeeId,
      departmentId,
      category,
      projectId: projectId || null,
      projectEvent: projectEvent || '',
      amount: numAmount,
      date: date ? new Date(date) : new Date(),
      purpose,
      description,
      receipt: receiptUrl,
      receiptOriginalName,
      status: 'Pending HOD Approval',
      isDuplicateFlag,
      duplicateDetails,
      workflowType: workflowType || (numAmount <= 2000 ? 'fast-track' : 'standard'),
    });

    await expense.save();

    // Increment department budget's pending amount
    await Budget.findOneAndUpdate(
      { departmentId, academicYear: '2026-2027' },
      { $inc: { pendingAmount: numAmount } }
    );

    const populatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email employeeId designation')
      .populate('departmentId', 'name code')
      .populate('projectId', 'name code budget remainingBudget');

    res.status(201).json({
      message: 'Expense submitted successfully with immutable ID: ' + expenseId,
      expense: populatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting expense', error: error.message });
  }
};

// @desc Get expenses based on role & filters
// @route GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { status, category, departmentId, search } = req.query;
    let filter = {};

    // Role-based visibility scoping
    if (req.user.role === 'faculty') {
      filter.employeeId = req.user._id;
    } else if (req.user.role === 'hod') {
      // HOD sees only their department's expenses
      const deptId = req.user.departmentId?._id || req.user.departmentId;
      if (deptId) {
        filter.departmentId = deptId;
      }
    }
    // Finance, Registrar, and Admin have university-wide view

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (departmentId && departmentId !== 'all') {
      filter.departmentId = departmentId;
    }

    if (search) {
      filter.$or = [
        { expenseId: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { projectEvent: { $regex: search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email employeeId designation')
      .populate('departmentId', 'name code')
      .populate('projectId', 'name code')
      .populate('hodApproval.approvedBy', 'name')
      .populate('financeApproval.verifiedBy', 'name')
      .populate('registrarApproval.approvedBy', 'name');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// @desc Get single expense by ID
// @route GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email employeeId designation phone')
      .populate('departmentId', 'name code')
      .populate('projectId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('financeApproval.verifiedBy', 'name email')
      .populate('registrarApproval.approvedBy', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    // Role check: Faculty can only see own expense
    if (
      req.user.role === 'faculty' &&
      expense.employeeId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Unauthorized to view this expense' });
    }

    // Find any associated reimbursement
    const reimbursement = await Reimbursement.findOne({ expenseId: expense._id }).populate('processedBy', 'name');

    res.json({ expense, reimbursement });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense details', error: error.message });
  }
};

// @desc HOD Review (Approve / Reject)
// @route PUT /api/expenses/:id/hod-review
export const hodReviewExpense = async (req, res) => {
  try {
    const { action, comment, rejectionReason } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Pending HOD Approval') {
      return res.status(400).json({ message: `Cannot review an expense with status: ${expense.status}` });
    }

    if (action === 'Approve') {
      expense.status = 'Pending Finance Verification';
      expense.hodApproval = {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comment: comment || 'Approved by HOD',
      };
    } else if (action === 'Reject') {
      expense.status = 'Rejected';
      expense.rejectionReason = rejectionReason || comment || 'Rejected by Department Head';
      expense.hodApproval = {
        status: 'Rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comment: comment || 'Rejected by HOD',
      };

      // Release pending budget
      await Budget.findOneAndUpdate(
        { departmentId: expense.departmentId, academicYear: '2026-2027' },
        { $inc: { pendingAmount: -expense.amount } }
      );
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be Approve or Reject' });
    }

    await expense.save();
    res.json({ message: `Expense ${action === 'Approve' ? 'approved' : 'rejected'} by HOD`, expense });
  } catch (error) {
    res.status(500).json({ message: 'Error updating HOD review', error: error.message });
  }
};

// @desc Finance Officer Audit & Verification
// @route PUT /api/expenses/:id/finance-verify
export const financeVerifyExpense = async (req, res) => {
  try {
    const { action, comment, rejectionReason } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Pending Finance Verification') {
      return res.status(400).json({ message: `Expense is not pending finance verification` });
    }

    if (action === 'Verify') {
      // Check if threshold requires Registrar / Management sign-off (e.g. > ₹25,000)
      if (expense.amount > 25000) {
        expense.status = 'Pending Registrar Approval';
      } else {
        expense.status = 'Approved';
      }

      expense.financeApproval = {
        status: 'Verified',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        comment: comment || 'Verified by Finance. Receipts audited.',
      };
    } else if (action === 'Reject') {
      expense.status = 'Rejected';
      expense.rejectionReason = rejectionReason || comment || 'Receipt audit failed or policy non-compliance';
      expense.financeApproval = {
        status: 'Rejected',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        comment: comment || 'Rejected by Finance',
      };

      // Release pending budget
      await Budget.findOneAndUpdate(
        { departmentId: expense.departmentId, academicYear: '2026-2027' },
        { $inc: { pendingAmount: -expense.amount } }
      );
    } else {
      return res.status(400).json({ message: 'Action must be Verify or Reject' });
    }

    await expense.save();
    res.json({ message: `Expense processed by Finance`, expense });
  } catch (error) {
    res.status(500).json({ message: 'Error in finance verification', error: error.message });
  }
};

// @desc Registrar / Management Approval (for high-value claims)
// @route PUT /api/expenses/:id/registrar-approve
export const registrarApproveExpense = async (req, res) => {
  try {
    const { action, comment, rejectionReason } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Pending Registrar Approval') {
      return res.status(400).json({ message: 'Expense is not awaiting Registrar authorization' });
    }

    if (action === 'Approve') {
      expense.status = 'Approved';
      expense.registrarApproval = {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comment: comment || 'Authorized by Registrar / Management for disbursement',
      };
    } else if (action === 'Reject') {
      expense.status = 'Rejected';
      expense.rejectionReason = rejectionReason || comment || 'Rejected by Management';
      expense.registrarApproval = {
        status: 'Rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comment: comment || 'Rejected by Management',
      };

      await Budget.findOneAndUpdate(
        { departmentId: expense.departmentId, academicYear: '2026-2027' },
        { $inc: { pendingAmount: -expense.amount } }
      );
    } else {
      return res.status(400).json({ message: 'Action must be Approve or Reject' });
    }

    await expense.save();
    res.json({ message: `Expense decision recorded by Registrar`, expense });
  } catch (error) {
    res.status(500).json({ message: 'Error in Registrar approval', error: error.message });
  }
};

// @desc Disburse Payment / Process Reimbursement
// @route POST /api/expenses/:id/disburse
export const disburseExpensePayment = async (req, res) => {
  try {
    const { paymentMethod, transactionReference, notes } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Approved') {
      return res.status(400).json({ message: `Cannot disburse payment for expense in status: ${expense.status}` });
    }

    // Create Reimbursement record
    const reimbursement = new Reimbursement({
      expenseId: expense._id,
      employeeId: expense.employeeId,
      amount: expense.amount,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Bank Transfer (NEFT/RTGS)',
      transactionReference: transactionReference || `UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Completed',
      processedBy: req.user._id,
      notes: notes || 'Disbursed by Finance Department',
    });

    await reimbursement.save();

    // Mark expense as Paid
    expense.status = 'Paid';
    await expense.save();

    // Atomic update of department budget: decrement pendingAmount, increment spentAmount
    await Budget.findOneAndUpdate(
      { departmentId: expense.departmentId, academicYear: '2026-2027' },
      {
        $inc: {
          pendingAmount: -expense.amount,
          spentAmount: expense.amount,
        },
      }
    );

    // If attached to a research project, decrement project remaining budget
    if (expense.projectId) {
      await Project.findByIdAndUpdate(expense.projectId, {
        $inc: {
          spentBudget: expense.amount,
          remainingBudget: -expense.amount,
        },
      });
    }

    res.json({
      message: `Payment of ₹${expense.amount.toLocaleString('en-IN')} successfully processed!`,
      expense,
      reimbursement,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Project from '../models/Project.js';
import Department from '../models/Department.js';

// @desc Get University-wide and Role-specific overview metrics
// @route GET /api/stats/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userDeptId = req.user.departmentId?._id || req.user.departmentId;

    // 1. Overall University Budget Overview
    const allBudgets = await Budget.find();
    const totalAllocatedBudget = allBudgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
    const totalSpentBudget = allBudgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
    const totalPendingBudget = allBudgets.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);

    // 2. Department-wise Spend
    const deptBudgets = await Budget.find().populate('departmentId', 'name code');
    const departmentWiseSpend = deptBudgets.map((b) => ({
      name: b.departmentId ? b.departmentId.name : 'Unknown',
      code: b.departmentId ? b.departmentId.code : 'UNK',
      allocated: b.allocatedAmount,
      spent: b.spentAmount,
      pending: b.pendingAmount,
      remaining: b.allocatedAmount - b.spentAmount,
    }));

    // 3. Category-wise expense breakdown
    const categoryAgg = await Expense.aggregate([
      { $match: { status: { $ne: 'Rejected' } } },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
    ]);
    const categoryWise = categoryAgg.map((c) => ({
      category: c._id,
      amount: c.totalAmount,
      count: c.count,
    }));

    // 4. Monthly Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyAgg = await Expense.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
          status: { $in: ['Approved', 'Paid'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalSpend: { $sum: '$amount' },
          claimCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthlyAgg.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      totalSpend: m.totalSpend,
      claimCount: m.claimCount,
    }));

    // 5. HOD specific department metrics
    let hodMetrics = null;
    if (userDeptId) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const pendingCount = await Expense.countDocuments({
        departmentId: userDeptId,
        status: 'Pending HOD Approval',
      });

      const approvedMonthCount = await Expense.countDocuments({
        departmentId: userDeptId,
        'hodApproval.status': 'Approved',
        'hodApproval.approvedAt': { $gte: firstDayOfMonth },
      });

      const rejectedCount = await Expense.countDocuments({
        departmentId: userDeptId,
        status: 'Rejected',
      });

      const deptBudgetRecord = await Budget.findOne({ departmentId: userDeptId, academicYear: '2026-2027' });

      hodMetrics = {
        pendingApproval: pendingCount,
        approvedThisMonth: approvedMonthCount,
        rejected: rejectedCount,
        totalDepartmentSpend: deptBudgetRecord ? deptBudgetRecord.spentAmount : 0,
        departmentBudget: deptBudgetRecord ? deptBudgetRecord.allocatedAmount : 0,
        remainingBudget: deptBudgetRecord ? deptBudgetRecord.allocatedAmount - deptBudgetRecord.spentAmount : 0,
      };
    }

    // 6. Finance Specific Metrics (Page 4)
    const approvedExpenses = await Expense.find({ status: 'Approved' });
    const pendingVerificationExpenses = await Expense.find({ status: 'Pending Finance Verification' });
    const paidExpenses = await Expense.find({ status: 'Paid' });
    const duplicateFlagsCount = await Expense.countDocuments({ isDuplicateFlag: true, status: { $ne: 'Rejected' } });

    const financeMetrics = {
      totalApproved: approvedExpenses.reduce((sum, e) => sum + e.amount, 0),
      pendingVerification: pendingVerificationExpenses.reduce((sum, e) => sum + e.amount, 0),
      reimbursementPending: approvedExpenses.reduce((sum, e) => sum + e.amount, 0), // approved awaiting payout
      totalPaid: paidExpenses.reduce((sum, e) => sum + e.amount, 0),
      duplicateFlagsCount,
    };

    // 7. Recent Activity / Transactions
    const recentExpenses = await Expense.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('employeeId', 'name designation')
      .populate('departmentId', 'name code');

    res.json({
      universityOverview: {
        totalBudget: totalAllocatedBudget,
        totalSpent: totalSpentBudget,
        pending: totalPendingBudget,
        remaining: totalAllocatedBudget - totalSpentBudget,
      },
      departmentWiseSpend,
      categoryWise,
      monthlyTrend,
      hodMetrics,
      financeMetrics,
      recentExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling dashboard statistics', error: error.message });
  }
};

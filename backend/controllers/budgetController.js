import Budget from '../models/Budget.js';
import Department from '../models/Department.js';

// @desc Get all budgets with department details
// @route GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = academicYear ? { academicYear } : {};
    const budgets = await Budget.find(filter).populate('departmentId', 'name code');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
};

// @desc Get budget for specific department
// @route GET /api/budgets/department/:departmentId
export const getDepartmentBudget = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const budget = await Budget.findOne({
      departmentId,
      academicYear: '2026-2027',
    }).populate('departmentId', 'name code');

    if (!budget) {
      return res.status(404).json({ message: 'Budget record not found for this department' });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department budget', error: error.message });
  }
};

// @desc Create or update department budget (Admin/Registrar)
// @route POST /api/budgets
export const saveBudget = async (req, res) => {
  try {
    const { departmentId, academicYear, allocatedAmount, categoryAllocations } = req.body;

    let budget = await Budget.findOne({ departmentId, academicYear: academicYear || '2026-2027' });

    if (budget) {
      budget.allocatedAmount = allocatedAmount;
      if (categoryAllocations) budget.categoryAllocations = categoryAllocations;
      await budget.save();
    } else {
      budget = new Budget({
        departmentId,
        academicYear: academicYear || '2026-2027',
        allocatedAmount,
        spentAmount: 0,
        pendingAmount: 0,
        categoryAllocations: categoryAllocations || [],
      });
      await budget.save();
    }

    const populated = await Budget.findById(budget._id).populate('departmentId', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error saving budget', error: error.message });
  }
};

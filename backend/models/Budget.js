import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-2027',
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryAllocations: [
      {
        category: { type: String, required: true },
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
      }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function () {
  return this.allocatedAmount - this.spentAmount;
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;

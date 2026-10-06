import mongoose from 'mongoose';

const reimbursementSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
      unique: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer (NEFT/RTGS)', 'Cheque', 'Corporate Card', 'Direct UPI'],
      default: 'Bank Transfer (NEFT/RTGS)',
    },
    transactionReference: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Completed',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Reimbursement = mongoose.model('Reimbursement', reimbursementSchema);
export default Reimbursement;

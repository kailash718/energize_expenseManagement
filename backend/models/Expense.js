import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    projectEvent: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    receipt: {
      type: String, // File path or URL
      default: '',
    },
    receiptOriginalName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending HOD Approval',
        'Pending Finance Verification',
        'Pending Registrar Approval',
        'Approved',
        'Rejected',
        'Paid',
      ],
      default: 'Pending HOD Approval',
    },
    hodApproval: {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      approvedAt: { type: Date, default: null },
      comment: { type: String, default: '' },
    },
    financeApproval: {
      status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      verifiedAt: { type: Date, default: null },
      comment: { type: String, default: '' },
    },
    registrarApproval: {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Not Required'], default: 'Pending' },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      approvedAt: { type: Date, default: null },
      comment: { type: String, default: '' },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isDuplicateFlag: {
      type: Boolean,
      default: false,
    },
    duplicateDetails: {
      type: String,
      default: '',
    },
    workflowType: {
      type: String,
      enum: ['standard', 'fast-track', 'research'],
      default: 'standard',
    },
  },
  { timestamps: true }
);

// Indexing for faster role-based queries
expenseSchema.index({ departmentId: 1, status: 1 });
expenseSchema.index({ employeeId: 1, createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

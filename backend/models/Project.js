import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    principalInvestigatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    spentBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    breakdown: {
      equipment: { allocated: { type: Number, default: 0 }, spent: { type: Number, default: 0 } },
      software: { allocated: { type: Number, default: 0 }, spent: { type: Number, default: 0 } },
      travel: { allocated: { type: Number, default: 0 }, spent: { type: Number, default: 0 } },
      research: { allocated: { type: Number, default: 0 }, spent: { type: Number, default: 0 } },
      other: { allocated: { type: Number, default: 0 }, spent: { type: Number, default: 0 } },
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;

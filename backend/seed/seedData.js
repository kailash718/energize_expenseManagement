import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Budget from '../models/Budget.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Reimbursement from '../models/Reimbursement.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_expense_db');
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await Budget.deleteMany({});
    await Project.deleteMany({});
    await Expense.deleteMany({});
    await Reimbursement.deleteMany({});

    console.log('[Seed] Existing records cleared');

    // 1. Create Departments
    const depts = await Department.insertMany([
      { name: 'Computer Science', code: 'CSE', description: 'Department of Computer Science & Engineering' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
      { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics Engineering' },
      { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
      { name: 'Management Studies', code: 'MGMT', description: 'Department of Business Administration & Management' },
    ]);

    const cseDept = depts[0];
    const itDept = depts[1];
    const eceDept = depts[2];
    const mechDept = depts[3];
    const mgmtDept = depts[4];

    // 2. Create Users
    // Admin
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@university.edu',
      password: 'AdminUser@2026',
      role: 'admin',
      employeeId: 'EMP-ADM-001',
      designation: 'Director of IT & Systems',
    });
    await admin.save();

    // HOD Computer Science
    const hodCS = new User({
      name: 'Prof. Ramesh K. Sharma',
      email: 'hod.cs@university.edu',
      password: 'HodUser@2026',
      role: 'hod',
      departmentId: cseDept._id,
      employeeId: 'EMP-HOD-101',
      designation: 'Head of Department, CSE',
      phone: '+91 98765 43210',
    });
    await hodCS.save();
    cseDept.hodId = hodCS._id;
    await cseDept.save();

    // Faculty - Dr. Arun Kumar (from PDF page 2)
    const facultyArun = new User({
      name: 'Dr. Arun Kumar',
      email: 'arun.kumar@university.edu',
      password: 'FacultyUser@2026',
      role: 'faculty',
      departmentId: cseDept._id,
      employeeId: 'EMP-FAC-201',
      designation: 'Associate Professor, CSE',
      phone: '+91 98765 11223',
    });
    await facultyArun.save();

    // Faculty - Dr. Priya Sharma
    const facultyPriya = new User({
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@university.edu',
      password: 'FacultyUser@2026',
      role: 'faculty',
      departmentId: cseDept._id,
      employeeId: 'EMP-FAC-202',
      designation: 'Assistant Professor, CSE',
    });
    await facultyPriya.save();

    // Finance Officer
    const financeOfficer = new User({
      name: 'Mr. Rajesh Gupta',
      email: 'finance@university.edu',
      password: 'FinanceUser@2026',
      role: 'finance',
      employeeId: 'EMP-FIN-301',
      designation: 'Senior Finance Officer & Auditor',
      phone: '+91 98765 33445',
    });
    await financeOfficer.save();

    // Registrar / Management
    const registrar = new User({
      name: 'Prof. V. Raman',
      email: 'registrar@university.edu',
      password: 'RegistrarUser@2026',
      role: 'registrar',
      employeeId: 'EMP-REG-401',
      designation: 'Registrar & Authorized Signatory',
      phone: '+91 98765 55667',
    });
    await registrar.save();

    console.log('[Seed] Users and Departments created');

    // 3. Create Department Budgets (Exact numbers from PDF page 4 and 6)
    await Budget.insertMany([
      {
        departmentId: cseDept._id,
        academicYear: '2026-2027',
        allocatedAmount: 2500000, // ₹25,00,000
        spentAmount: 1750000,     // ₹17,50,000
        pendingAmount: 125000,    // ₹1,25,000
        categoryAllocations: [
          { category: 'Laboratory equipment', allocated: 800000, spent: 550000 },
          { category: 'Conferences and seminars', allocated: 400000, spent: 280000 },
          { category: 'Software licenses', allocated: 500000, spent: 420000 },
          { category: 'Research expenses', allocated: 500000, spent: 350000 },
          { category: 'Department maintenance', allocated: 300000, spent: 150000 },
        ],
      },
      {
        departmentId: mechDept._id,
        academicYear: '2026-2027',
        allocatedAmount: 1000000,
        spentAmount: 625000,
        pendingAmount: 85000,
      },
      {
        departmentId: eceDept._id,
        academicYear: '2026-2027',
        allocatedAmount: 800000,
        spentAmount: 575000,
        pendingAmount: 65000,
      },
      {
        departmentId: mgmtDept._id,
        academicYear: '2026-2027',
        allocatedAmount: 700000,
        spentAmount: 425000,
        pendingAmount: 50000,
      },
      {
        departmentId: itDept._id,
        academicYear: '2026-2027',
        allocatedAmount: 1000000,
        spentAmount: 475000,
        pendingAmount: 60000,
      },
    ]);

    // 4. Create Research Project (Exact from PDF page 4 & 5)
    const projectAI = new Project({
      name: 'AI-Based Medical Image Analysis',
      code: 'RES-AIMIA-2026',
      departmentId: cseDept._id,
      principalInvestigatorId: facultyArun._id,
      budget: 1000000, // ₹10,00,000
      spentBudget: 750000,
      remainingBudget: 250000, // ₹2,50,000
      breakdown: {
        equipment: { allocated: 300000, spent: 220000 },
        software: { allocated: 100000, spent: 85000 },
        travel: { allocated: 75000, spent: 60000 },
        research: { allocated: 225000, spent: 185000 },
        other: { allocated: 50000, spent: 30000 },
      },
      status: 'Active',
    });
    await projectAI.save();

    // 5. Create Sample Expenses
    // Expense 1: Exact from PDF Page 2 & 3: EXP-2026-00125
    const exp1 = new Expense({
      expenseId: 'EXP-2026-00125',
      employeeId: facultyArun._id,
      departmentId: cseDept._id,
      category: 'Conferences and seminars',
      projectId: projectAI._id,
      projectEvent: 'AI Research Conference',
      amount: 12500,
      date: new Date('2026-09-28'),
      purpose: 'International Conference registration & travel',
      description: 'Attended the 2026 International Conference on Neural Architectures to present our research paper on Medical Image Diagnosis.',
      receipt: '/uploads/sample-conference-receipt.pdf',
      receiptOriginalName: 'conference_receipt.pdf',
      status: 'Pending HOD Approval',
      workflowType: 'standard',
    });
    await exp1.save();

    // Expense 2: Research Equipment (High Value - triggers Registrar approval)
    const exp2 = new Expense({
      expenseId: 'EXP-2026-00126',
      employeeId: facultyArun._id,
      departmentId: cseDept._id,
      category: 'Laboratory equipment',
      projectId: projectAI._id,
      projectEvent: 'AI Laboratory GPU Node Expansion',
      amount: 85000,
      date: new Date('2026-09-20'),
      purpose: 'Procurement of High-Performance Tensor Core GPU for Deep Learning Lab',
      description: 'High-throughput hardware server upgrade for accelerating training cycles on 3D CT scan models.',
      receipt: '/uploads/sample-gpu-invoice.pdf',
      receiptOriginalName: 'nvidia_gpu_invoice.pdf',
      status: 'Pending Registrar Approval',
      workflowType: 'standard',
      hodApproval: {
        status: 'Approved',
        approvedBy: hodCS._id,
        approvedAt: new Date('2026-09-22'),
        comment: 'Essential equipment for the DST funded project. Approved.',
      },
      financeApproval: {
        status: 'Verified',
        verifiedBy: financeOfficer._id,
        verifiedAt: new Date('2026-09-24'),
        comment: 'Quotation verified with GEM portal, tax invoices checked. Forwarded for Registrar authorization due to value > ₹25,000.',
      },
    });
    await exp2.save();

    // Expense 3: Approved ready for payment
    const exp3 = new Expense({
      expenseId: 'EXP-2026-00127',
      employeeId: facultyPriya._id,
      departmentId: cseDept._id,
      category: 'Software licenses',
      projectEvent: 'Departmental Cloud Computing Lab',
      amount: 22000,
      date: new Date('2026-09-25'),
      purpose: 'Annual Cloud Cluster Subscription Renewal',
      description: 'Renewed AWS Educational credits and PyTorch Cloud computing workspace.',
      receipt: '/uploads/sample-software-invoice.pdf',
      receiptOriginalName: 'aws_invoice_sept2026.pdf',
      status: 'Approved',
      workflowType: 'standard',
      hodApproval: {
        status: 'Approved',
        approvedBy: hodCS._id,
        approvedAt: new Date('2026-09-26'),
        comment: 'Approved for CS lab usage.',
      },
      financeApproval: {
        status: 'Verified',
        verifiedBy: financeOfficer._id,
        verifiedAt: new Date('2026-09-27'),
        comment: 'Verified and queued for disbursement.',
      },
    });
    await exp3.save();

    // Expense 4: Fast-track expense already Paid with Reimbursement record
    const exp4 = new Expense({
      expenseId: 'EXP-2026-00128',
      employeeId: facultyArun._id,
      departmentId: cseDept._id,
      category: 'Books and journals',
      projectEvent: 'Faculty Book Grant',
      amount: 1800,
      date: new Date('2026-09-15'),
      purpose: 'Reference Textbooks on Machine Learning in Healthcare',
      description: 'Purchased academic reference books for postgraduate curriculum reference.',
      receipt: '/uploads/sample-book-bill.pdf',
      receiptOriginalName: 'oxford_books_bill.pdf',
      status: 'Paid',
      workflowType: 'fast-track',
      hodApproval: {
        status: 'Approved',
        approvedBy: hodCS._id,
        approvedAt: new Date('2026-09-16'),
        comment: 'Fast-track book allowance approved.',
      },
      financeApproval: {
        status: 'Verified',
        verifiedBy: financeOfficer._id,
        verifiedAt: new Date('2026-09-17'),
        comment: 'Audited and cleared for instant payment.',
      },
    });
    await exp4.save();

    const reimb4 = new Reimbursement({
      expenseId: exp4._id,
      employeeId: facultyArun._id,
      amount: 1800,
      paymentDate: new Date('2026-09-18'),
      paymentMethod: 'Direct UPI',
      transactionReference: 'UPI-SBI-20260918-994821',
      status: 'Completed',
      processedBy: financeOfficer._id,
      notes: 'Direct reimbursement transferred to employee registered salary account.',
    });
    await reimb4.save();

    // Expense 5: Another paid high-value student event expense
    const exp5 = new Expense({
      expenseId: 'EXP-2026-00129',
      employeeId: facultyPriya._id,
      departmentId: cseDept._id,
      category: 'Student events',
      projectEvent: 'National Hackathon 2026',
      amount: 45000,
      date: new Date('2026-09-10'),
      purpose: 'Hackathon Prize Pool and Participant Refreshments',
      description: 'Expenses incurred for conducting 36-hour Inter-College Hackathon with 250 attendees.',
      receipt: '/uploads/sample-event-receipt.pdf',
      receiptOriginalName: 'hackathon_catering_vouchers.pdf',
      status: 'Paid',
      workflowType: 'standard',
      hodApproval: {
        status: 'Approved',
        approvedBy: hodCS._id,
        approvedAt: new Date('2026-09-11'),
        comment: 'Approved by CS HOD.',
      },
      financeApproval: {
        status: 'Verified',
        verifiedBy: financeOfficer._id,
        verifiedAt: new Date('2026-09-12'),
        comment: 'All vendor bills validated.',
      },
      registrarApproval: {
        status: 'Approved',
        approvedBy: registrar._id,
        approvedAt: new Date('2026-09-13'),
        comment: 'Authorized payment from University Student Activity Fund.',
      },
    });
    await exp5.save();

    const reimb5 = new Reimbursement({
      expenseId: exp5._id,
      employeeId: facultyPriya._id,
      amount: 45000,
      paymentDate: new Date('2026-09-14'),
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      transactionReference: 'NEFT-HDFC-20260914-77123',
      status: 'Completed',
      processedBy: financeOfficer._id,
      notes: 'Full payment disbursed to faculty event coordinator.',
    });
    await reimb5.save();

    // Expense 6: Pending Finance Verification
    const exp6 = new Expense({
      expenseId: 'EXP-2026-00130',
      employeeId: facultyArun._id,
      departmentId: cseDept._id,
      category: 'Faculty/staff travel',
      projectEvent: 'Curriculum Development Meeting',
      amount: 6400,
      date: new Date('2026-09-29'),
      purpose: 'Travel allowances and train tickets for state board consultation',
      description: 'Official travel reimbursement for attending Higher Education Council meeting.',
      receipt: '/uploads/sample-train-ticket.pdf',
      receiptOriginalName: 'irctc_ticket_receipt.pdf',
      status: 'Pending Finance Verification',
      workflowType: 'standard',
      hodApproval: {
        status: 'Approved',
        approvedBy: hodCS._id,
        approvedAt: new Date('2026-09-30'),
        comment: 'Official travel deputed by department.',
      },
    });
    await exp6.save();

    console.log('[Seed] Sample expenses and reimbursements created successfully!');
    console.log('--------------------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('1. Admin: admin@university.edu / AdminUser@2026');
    console.log('2. HOD CS: hod.cs@university.edu / HodUser@2026');
    console.log('3. Faculty: arun.kumar@university.edu / FacultyUser@2026');
    console.log('4. Finance: finance@university.edu / FinanceUser@2026');
    console.log('5. Registrar: registrar@university.edu / RegistrarUser@2026');
    console.log('--------------------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();

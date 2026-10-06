import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStatsApi } from '../services/api';
import ExpenseModal from '../components/ExpenseModal';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building,
  PlusCircle,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  CreditCard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewReceiptExpense, setViewReceiptExpense] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStatsApi();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overview = stats?.universityOverview || {
    totalBudget: 5000000,
    totalSpent: 3250000,
    pending: 325000,
    remaining: 1750000,
  };

  const deptData = stats?.departmentWiseSpend || [];
  const categoryData = stats?.categoryWise || [];
  const monthlyTrend = stats?.monthlyTrend || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              AY 2026-2027 Dashboard
            </span>
            <span className="text-xs text-slate-300">• Multi-Level Approval System</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {user?.role === 'faculty' && 'Submit institutional travel, conference, and project claims with real-time status tracking.'}
            {user?.role === 'hod' && `Review and approve departmental claims for ${user?.departmentId?.name || 'your department'}.`}
            {user?.role === 'finance' && 'Audit invoices, verify duplicate-claim flags, and execute payment reimbursements.'}
            {user?.role === 'registrar' && 'University-wide financial oversight and high-value expenditure authorizations.'}
            {user?.role === 'admin' && 'Enterprise administration, department budgets, and user governance.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Claim</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Alert Callouts */}
      {user?.role === 'hod' && stats?.hodMetrics && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">HOD Department Action Center</h4>
              <p className="text-xs text-emerald-700">
                You have <strong>{stats.hodMetrics.pendingApproval} claim(s)</strong> awaiting your decision.
              </p>
            </div>
          </div>
          <Link
            to="/hod-approvals"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg self-start sm:self-auto transition-colors"
          >
            Open HOD Approvals →
          </Link>
        </div>
      )}

      {user?.role === 'finance' && stats?.financeMetrics && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 text-white rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Finance Disbursal Queue</h4>
              <p className="text-xs text-amber-700">
                Pending Verification: <strong>₹{stats.financeMetrics.pendingVerification?.toLocaleString('en-IN')}</strong> • Approved Awaiting Payout: <strong>₹{stats.financeMetrics.reimbursementPending?.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>
          <Link
            to="/finance-audit"
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg self-start sm:self-auto transition-colors"
          >
            Process Reimbursements →
          </Link>
        </div>
      )}

      {/* KPI Cards (Exact Wireframe layout from PDF page 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Budget</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{overview.totalBudget?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            University Annual Allocation
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{overview.totalSpent?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {((overview.totalSpent / overview.totalBudget) * 100).toFixed(1)}% budget utilized
          </div>
        </div>

        {/* Pending Claims */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Claims</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            ₹{overview.pending?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            In review / approval pipeline
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Balance</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            ₹{overview.remaining?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Available runway for fiscal year
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise Expenses (Wireframe from PDF page 6) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department-wise Expenses & Allocations
              </h3>
              <p className="text-xs text-slate-500">
                Comparative spend vs allocated budget per academic department
              </p>
            </div>
            <Link
              to="/budgets"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Manage Budgets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="spent" name="Spent Amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="remaining" name="Remaining Budget" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie / Donut) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Expense Category Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distribution across academic & operational categories
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No category claims processed yet.</p>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryData.slice(0, 5).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-slate-700 truncate">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-900">
                  ₹{item.amount?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent University Expense Claims
            </h3>
            <p className="text-xs text-slate-500">
              Latest claims routed through the multi-level workflow
            </p>
          </div>
          <Link
            to="/expenses"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>View All Claims</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Expense ID</th>
                <th className="px-6 py-3">Employee & Dept</th>
                <th className="px-6 py-3">Category & Purpose</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Current Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentExpenses?.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    {exp.expenseId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{exp.employeeId?.name}</div>
                    <div className="text-[11px] text-slate-400">{exp.departmentId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{exp.category}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{exp.purpose}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{exp.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(exp.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        exp.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : exp.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : exp.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewReceiptExpense(exp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Submission Modal */}
      <ExpenseModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchStats}
      />

      {/* Receipt Viewer Modal */}
      <ReceiptViewerModal
        expense={viewReceiptExpense}
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
      />
    </div>
  );
}

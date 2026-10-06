import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpensesApi } from '../services/api';
import ExpenseModal from '../components/ExpenseModal';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewReceiptExpense, setViewReceiptExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await getExpensesApi({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending Registrar Approval':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Pending Finance Verification':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Pending HOD Approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Expense Ledger</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {user?.role === 'faculty' ? 'My Expense Reimbursements' : 'University Expense Claims'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'faculty'
              ? 'Track real-time multi-level approval stages and payment releases'
              : 'Institutional expense record repository with multi-tier audit trail'}
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Expense Claim</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search EXP-ID, purpose, event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'Pending HOD Approval', label: 'Pending HOD' },
            { id: 'Pending Finance Verification', label: 'Pending Finance' },
            { id: 'Pending Registrar Approval', label: 'Pending Registrar' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading expense claims...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No expense claims found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Expense ID</th>
                  <th className="px-6 py-3">Claimant</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Category & Purpose</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Approval Stage</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {exp.expenseId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {exp.employeeId?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {exp.departmentId?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{exp.category}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">
                        {exp.purpose}
                      </div>
                      {exp.rejectionReason && (
                        <div className="text-rose-600 text-[10px] mt-0.5 font-medium">
                          Reason: {exp.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ₹{exp.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(exp.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          exp.status
                        )}`}
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
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchExpenses}
      />

      <ReceiptViewerModal
        expense={viewReceiptExpense}
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
      />
    </div>
  );
}

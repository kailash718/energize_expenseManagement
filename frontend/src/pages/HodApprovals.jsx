import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpensesApi, hodReviewExpenseApi, getDashboardStatsApi } from '../services/api';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Building2,
  AlertCircle,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';

export default function HodApprovals() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [comments, setComments] = useState({});
  const [viewReceiptExpense, setViewReceiptExpense] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const deptId = user?.departmentId?._id || user?.departmentId;
      const [expRes, statsRes] = await Promise.all([
        getExpensesApi({
          departmentId: deptId,
          status: 'Pending HOD Approval',
        }),
        getDashboardStatsApi(),
      ]);
      setExpenses(expRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error loading HOD approvals:', err);
      setErrorMessage('Failed to load pending department claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleReview = async (expenseId, action) => {
    const comment = comments[expenseId] || '';
    if (action === 'Reject' && !comment.trim()) {
      alert('Please provide a reason in the comment box when rejecting a claim.');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [expenseId]: true }));
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await hodReviewExpenseApi(expenseId, {
        action,
        comment: comment || (action === 'Approve' ? 'Approved by HOD' : 'Rejected'),
        rejectionReason: action === 'Reject' ? comment : '',
      });

      setSuccessMessage(`Expense successfully ${action === 'Approve' ? 'approved' : 'rejected'}.`);
      setComments((prev) => {
        const copy = { ...prev };
        delete copy[expenseId];
        return copy;
      });
      await loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [expenseId]: false }));
    }
  };

  const hodMetrics = stats?.hodMetrics || {
    pendingApproval: expenses.length,
    approvedThisMonth: 32,
    rejected: 2,
    totalDepartmentSpend: 485000,
  };

  const deptName = user?.departmentId?.name || 'Computer Science Department';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>HOD Department Portal</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {deptName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and authorize departmental faculty expenditure claims
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metrics Bar (Exact matching PDF page 3 wireframe) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Approval</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {hodMetrics.pendingApproval}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting your review</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Approved This Month</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {hodMetrics.approvedThisMonth}
          </div>
          <span className="text-[11px] text-slate-400">Cleared for finance</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Rejected</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {hodMetrics.rejected}
          </div>
          <span className="text-[11px] text-slate-400">Non-compliant</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Department Spend</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ₹{hodMetrics.totalDepartmentSpend?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">AY 2026-2027 cumulative</span>
        </div>
      </div>

      {/* Approval Cards List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">
            Pending Claims Awaiting HOD Sign-off ({expenses.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading department claims...
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">All Caught Up!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no pending expense claims awaiting HOD approval for {deptName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map((exp) => (
              <div
                key={exp._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Fast track tag */}
                {exp.workflowType === 'fast-track' && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    Fast-Track Micro-Claim
                  </span>
                )}

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {exp.expenseId}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{exp.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Claimant & Category Info */}
                  <div className="space-y-1 mb-3 text-xs">
                    <div>
                      <span className="text-slate-400">Faculty: </span>
                      <strong className="text-slate-800">{exp.employeeId?.name}</strong>{' '}
                      <span className="text-slate-400">({exp.employeeId?.designation})</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Category: </span>
                      <span className="font-medium text-slate-700">{exp.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Purpose: </span>
                      <span className="font-semibold text-slate-800">{exp.purpose}</span>
                    </div>
                    {exp.projectEvent && (
                      <div>
                        <span className="text-slate-400">Project / Event: </span>
                        <span className="text-slate-700">{exp.projectEvent}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 pt-1">
                      Submitted on: {new Date(exp.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* View Receipt button (Exact wireframe: [ View Receipt ]) */}
                  <div className="mb-3">
                    <button
                      onClick={() => setViewReceiptExpense(exp)}
                      className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>[ View Receipt ]</span>
                    </button>
                  </div>

                  {/* Comment Input (Exact wireframe: Comment: [__________]) */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>HOD Comment / Justification:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Add review feedback or reason..."
                      value={comments[exp._id] || ''}
                      onChange={(e) =>
                        setComments((prev) => ({ ...prev, [exp._id]: e.target.value }))
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Approve & Reject buttons (Exact wireframe: [ Approve ] [ Reject ]) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReview(exp._id, 'Approve')}
                    disabled={actionLoading[exp._id]}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>[ Approve ]</span>
                  </button>
                  <button
                    onClick={() => handleReview(exp._id, 'Reject')}
                    disabled={actionLoading[exp._id]}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>[ Reject ]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Inspection Modal */}
      <ReceiptViewerModal
        expense={viewReceiptExpense}
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
      />
    </div>
  );
}

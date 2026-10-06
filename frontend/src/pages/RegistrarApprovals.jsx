import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpensesApi, registrarApproveExpenseApi } from '../services/api';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import { Shield, CheckCircle2, AlertCircle, Check, X, FileText } from 'lucide-react';

export default function RegistrarApprovals() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [comments, setComments] = useState({});
  const [viewReceiptExpense, setViewReceiptExpense] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getExpensesApi({ status: 'Pending Registrar Approval' });
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching registrar approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDecision = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage('');
    try {
      await registrarApproveExpenseApi(id, {
        action,
        comment: comments[id] || (action === 'Approve' ? 'Authorized by Registrar' : 'Rejected by Registrar'),
        rejectionReason: action === 'Reject' ? comments[id] || 'Rejected by Registrar' : '',
      });
      setMessage(`Claim successfully ${action === 'Approve' ? 'authorized for disbursement' : 'rejected'}.`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Registrar & Executive Management Portal</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            High-Value Expenditure Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Final sanction for institutional claims exceeding department thresholds (&gt; ₹25,000)
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Claims Awaiting Executive Approval ({expenses.length})
          </h3>
          <span className="text-xs text-indigo-600 font-semibold">
            Institutional Sanction Authority
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading claims...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No high-value claims pending executive approval.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <div key={exp._id} className="p-6 space-y-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                      {exp.expenseId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {exp.employeeId?.name}
                    </h4>
                    <span className="text-xs text-slate-500">• {exp.departmentId?.name}</span>
                  </div>
                  <div className="text-lg font-black text-indigo-900">
                    ₹{exp.amount?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div>
                    <strong className="text-slate-700">Purpose: </strong>
                    <span className="text-slate-800">{exp.purpose}</span>
                  </div>
                  {exp.description && (
                    <div>
                      <strong className="text-slate-700">Justification: </strong>
                      <span className="text-slate-600">{exp.description}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="text-emerald-700 font-medium">
                      ✓ HOD Endorsement: "{exp.hodApproval?.comment || 'Approved'}"
                    </div>
                    <div className="text-blue-700 font-medium">
                      ✓ Finance Audit: "{exp.financeApproval?.comment || 'Audited'}"
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    onClick={() => setViewReceiptExpense(exp)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Examine Invoice</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Registrar sanction comments..."
                    value={comments[exp._id] || ''}
                    onChange={(e) => setComments({ ...comments, [exp._id]: e.target.value })}
                    className="flex-1 text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDecision(exp._id, 'Approve')}
                      disabled={actionLoading[exp._id]}
                      className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sanction Payment</span>
                    </button>
                    <button
                      onClick={() => handleDecision(exp._id, 'Reject')}
                      disabled={actionLoading[exp._id]}
                      className="flex-1 sm:flex-none px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReceiptViewerModal
        expense={viewReceiptExpense}
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getExpensesApi,
  financeVerifyExpenseApi,
  getDashboardStatsApi,
} from '../services/api';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import PaymentModal from '../components/PaymentModal';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  CreditCard,
  AlertTriangle,
  FileText,
  DollarSign,
  Check,
  X,
  Search,
} from 'lucide-react';

export default function FinanceAudit() {
  const { user } = useAuth();
  const [pendingVerification, setPendingVerification] = useState([]);
  const [approvedForPayment, setApprovedForPayment] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [viewReceiptExpense, setViewReceiptExpense] = useState(null);
  const [disburseExpense, setDisburseExpense] = useState(null);
  const [comments, setComments] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [verRes, appRes, statsRes] = await Promise.all([
        getExpensesApi({ status: 'Pending Finance Verification' }),
        getExpensesApi({ status: 'Approved' }),
        getDashboardStatsApi(),
      ]);
      setPendingVerification(verRes.data);
      setApprovedForPayment(appRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error loading finance audit data:', err);
      setErrorMessage('Failed to fetch finance audit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleVerify = async (expenseId, action) => {
    const comment = comments[expenseId] || '';
    setActionLoading((prev) => ({ ...prev, [expenseId]: true }));
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await financeVerifyExpenseApi(expenseId, {
        action,
        comment: comment || 'Verified by Finance Auditor',
        rejectionReason: action === 'Reject' ? comment || 'Failed compliance check' : '',
      });
      setSuccessMessage(`Expense claim ${action === 'Verify' ? 'audited & verified' : 'rejected'}.`);
      setComments((prev) => {
        const copy = { ...prev };
        delete copy[expenseId];
        return copy;
      });
      await loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification failed.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [expenseId]: false }));
    }
  };

  const financeMetrics = stats?.financeMetrics || {
    totalApproved: 1850000,
    pendingVerification: 225000,
    reimbursementPending: 175000,
    totalPaid: 1450000,
    duplicateFlagsCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Finance & Audit Control Hub</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Institutional Audit & Payment Disbursement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit tax invoices, detect duplicate claims, verify limits, and release payments
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
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Finance Metrics Grid (Matching PDF Page 4 Wireframe) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Approved</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{financeMetrics.totalApproved?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Total compliant claims</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{financeMetrics.pendingVerification?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Requires audit check</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Reimbursement Pending</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            ₹{financeMetrics.reimbursementPending?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Approved, ready to disburse</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Paid Disbursed</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{financeMetrics.totalPaid?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Successfully settled</span>
        </div>
      </div>

      {/* Section 1: Ready for Payment Disbursal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Approved Claims Ready for Payment Release ({approvedForPayment.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Step 4 of 4: Direct Reimbursement
          </span>
        </div>

        {approvedForPayment.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No approved claims currently awaiting payout disbursement.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {approvedForPayment.map((exp) => (
              <div
                key={exp._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {exp.expenseId}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {exp.employeeId?.name}
                    </span>
                    <span className="text-xs text-slate-500">({exp.departmentId?.name})</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{exp.category}</span>: {exp.purpose}
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>HOD: "{exp.hodApproval?.comment || 'Approved'}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Net Disbursal</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{exp.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewReceiptExpense(exp)}
                    className="px-3 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    View Bill
                  </button>
                  <button
                    onClick={() => setDisburseExpense(exp)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Disburse Payment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Pending Finance Audit / Verification */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pending Finance Audit & Invoice Verification ({pendingVerification.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Step 3 of 4: Tax Audit & Fraud Check
          </span>
        </div>

        {pendingVerification.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No claims pending finance audit.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingVerification.map((exp) => (
              <div key={exp._id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {exp.expenseId}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {exp.employeeId?.name}
                    </span>
                    <span className="text-xs text-slate-500">• {exp.departmentId?.name}</span>
                    {exp.isDuplicateFlag && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3 h-3" />
                        Duplicate Flag
                      </span>
                    )}
                  </div>
                  <span className="text-base font-black text-slate-900">
                    ₹{exp.amount?.toLocaleString('en-IN')}
                  </span>
                </div>

                {exp.isDuplicateFlag && exp.duplicateDetails && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    ⚠️ {exp.duplicateDetails}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Category: </span>
                    <span className="font-medium text-slate-800">{exp.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Purpose: </span>
                    <span className="text-slate-800">{exp.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date: </span>
                    <span className="text-slate-800">
                      {new Date(exp.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Audit Controls & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setViewReceiptExpense(exp)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Audit Invoice File</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Auditor comments / GEM invoice verification note..."
                    value={comments[exp._id] || ''}
                    onChange={(e) =>
                      setComments((prev) => ({ ...prev, [exp._id]: e.target.value }))
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none w-full"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleVerify(exp._id, 'Verify')}
                      disabled={actionLoading[exp._id]}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{exp.amount > 25000 ? 'Verify & Route to Registrar' : 'Verify & Clear'}</span>
                    </button>
                    <button
                      onClick={() => handleVerify(exp._id, 'Reject')}
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

      {/* Modals */}
      <ReceiptViewerModal
        expense={viewReceiptExpense}
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
      />

      <PaymentModal
        expense={disburseExpense}
        isOpen={!!disburseExpense}
        onClose={() => setDisburseExpense(null)}
        onSuccess={loadData}
      />
    </div>
  );
}

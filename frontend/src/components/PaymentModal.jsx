import React, { useState } from 'react';
import { disburseExpenseApi } from '../services/api';
import { X, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

export default function PaymentModal({ expense, isOpen, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [transactionReference, setTransactionReference] = useState(
    `UTR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [notes, setNotes] = useState('Disbursed to faculty salary account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleDisburse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await disburseExpenseApi(expense._id, {
        paymentMethod,
        transactionReference,
        notes,
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Payment processing failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-sm font-bold">Process Reimbursement Disbursal</h3>
              <p className="text-[11px] text-emerald-100">
                Claim: {expense.expenseId} • {expense.employeeId?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDisburse} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-medium">Reimbursement Amount</span>
              <div className="text-2xl font-black text-emerald-900">
                ₹{expense.amount?.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-xs text-emerald-700">
              <div>Dept: {expense.departmentId?.name}</div>
              <div className="font-semibold text-emerald-900">Status: Approved</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursement Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
              <option value="Direct UPI">Direct UPI Transfer</option>
              <option value="Corporate Card">University Corporate Card Settlement</option>
              <option value="Cheque">University Demand Draft / Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction UTR / Bank Reference Number *
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Notes / Voucher Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Disbursing...' : 'Confirm & Disburse Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

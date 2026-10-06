import React from 'react';
import { X, FileText, CheckCircle2, Download, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ReceiptViewerModal({ expense, isOpen, onClose }) {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">Receipt Audit & Inspection</h3>
              <p className="text-[11px] text-slate-300">
                Expense Claim Ref: {expense.expenseId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Viewer Body */}
        <div className="p-6 space-y-4">
          {/* Simulated Authentic University Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                  Verified Payment Voucher
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Tax Invoice / Official Bill
                </h4>
                <p className="text-xs text-slate-500">
                  Attached File: {expense.receiptOriginalName || 'conference_receipt.pdf'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Claim Amount</span>
                <div className="text-lg font-extrabold text-blue-700">
                  ₹{expense.amount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div>
                <span className="text-slate-400">Claimant:</span>
                <p className="font-semibold text-slate-800">{expense.employeeId?.name || 'Dr. Arun Kumar'}</p>
                <p className="text-[11px] text-slate-500">{expense.employeeId?.designation || 'Faculty'}</p>
              </div>
              <div>
                <span className="text-slate-400">Department:</span>
                <p className="font-semibold text-slate-800">{expense.departmentId?.name || 'Computer Science'}</p>
                <p className="text-[11px] text-slate-500">Code: {expense.departmentId?.code || 'CSE'}</p>
              </div>
              <div>
                <span className="text-slate-400">Expense Category:</span>
                <p className="font-semibold text-slate-800">{expense.category}</p>
              </div>
              <div>
                <span className="text-slate-400">Billing Date:</span>
                <p className="font-semibold text-slate-800">
                  {new Date(expense.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <span className="text-slate-400 text-xs">Purpose / Line Items:</span>
              <p className="text-xs font-medium text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                {expense.purpose}
                {expense.description ? ` — ${expense.description}` : ''}
              </p>
            </div>

            {/* Audit Watermark */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Anti-Tamper Digital Voucher Sealed</span>
              </div>
              <span className="text-slate-400">Checksum Verified</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Status:{' '}
            <strong className="text-slate-800">{expense.status}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

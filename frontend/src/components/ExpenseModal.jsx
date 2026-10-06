import React, { useState, useEffect } from 'react';
import { createExpenseApi, getProjectsApi } from '../services/api';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const CATEGORIES = [
  'Faculty/staff travel',
  'Conferences and seminars',
  'Research expenses',
  'Laboratory equipment',
  'Books and journals',
  'Stationery',
  'Software licenses',
  'Internet and IT services',
  'Student events',
  'Sports activities',
  'Cultural events',
  'Department maintenance',
  'Hostel expenses',
  'Transportation',
  'Electricity and utilities',
  'Guest accommodation',
  'Procurement',
  'Other administrative expenses',
];

export default function ExpenseModal({ isOpen, onClose, onSuccess }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [projectEvent, setProjectEvent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getProjectsApi()
        .then((res) => setProjects(res.data))
        .catch((err) => console.error('Error fetching projects:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const isFastTrack = numAmount > 0 && numAmount <= 2000;
  const requiresRegistrar = numAmount > 25000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) {
      setError('Please provide a valid expense amount.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please provide a clear purpose for this claim.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('amount', numAmount);
      formData.append('date', date);
      formData.append('purpose', purpose);
      formData.append('projectEvent', projectEvent);
      if (projectId) formData.append('projectId', projectId);
      formData.append('description', description);
      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      } else {
        // Fallback default sample receipt if no local file selected
        formData.append('receiptUrl', '/uploads/sample-voucher.pdf');
        formData.append('receiptOriginalName', `${category.toLowerCase().replace(/\s+/g, '_')}_bill.pdf`);
      }

      await createExpenseApi(formData);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit expense.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Submit University Expense Claim</h3>
            <p className="text-xs text-slate-300">
              Auto-generated immutable Expense ID will be assigned upon submission
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Indicator Banner */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              isFastTrack
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : requiresRegistrar
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">
                {isFastTrack
                  ? 'Fast-Track Micro-Expense Workflow (≤ ₹2,000)'
                  : requiresRegistrar
                  ? 'High-Value Expenditure (> ₹25,000): Requires Multi-Tier Registrar Sign-off'
                  : 'Standard Approval Hierarchy'}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isFastTrack
                  ? 'Faculty Submit → HOD Review → Finance Direct Release'
                  : requiresRegistrar
                  ? 'Faculty Submit → HOD Review → Finance Audit → Registrar Sign-off → Disbursement'
                  : 'Faculty Submit → HOD Review → Finance Verification → Disbursal'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Claim Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 12500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Expense *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Link to Research Project */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Research Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  const p = projects.find((x) => x._id === e.target.value);
                  if (p && !projectEvent) setProjectEvent(p.name);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- No Research Grant (General Dept Expense) --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Bal: ₹{p.remainingBudget?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose & Project / Event Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purpose / Short Justification *
              </label>
              <input
                type="text"
                placeholder="e.g. International Conference, Lab Equipment"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project / Event / Workshop Name
              </label>
              <input
                type="text"
                placeholder="e.g. AI Research Conference, DST Grant"
                value={projectEvent}
                onChange={(e) => setProjectEvent(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Academic Value
            </label>
            <textarea
              rows={2}
              placeholder="Provide context on why this expenditure was required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt / Tax Invoice Attachment (PDF or Image)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50 transition-colors">
              <input
                type="file"
                id="receiptFile"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="receiptFile" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                {receiptFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-blue-600">
                    <FileText className="w-4 h-4" />
                    <span>{receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      Click to choose receipt file
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, PNG, JPG (up to 10MB). Sample receipt will be attached if none chosen.
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit for HOD Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

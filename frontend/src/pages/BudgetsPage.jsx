import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBudgetsApi, saveBudgetApi } from '../services/api';
import { PiggyBank, PlusCircle, Building, CheckCircle2, TrendingUp, AlertCircle, Edit3 } from 'lucide-react';

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBudget, setEditBudget] = useState(null);
  const [allocatedInput, setAllocatedInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await getBudgetsApi();
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [user]);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!editBudget || !allocatedInput) return;
    try {
      await saveBudgetApi({
        departmentId: editBudget.departmentId._id,
        allocatedAmount: Number(allocatedInput),
        academicYear: editBudget.academicYear || '2026-2027',
      });
      setSuccessMsg(`Budget allocation updated for ${editBudget.departmentId.name}`);
      setEditBudget(null);
      await loadBudgets();
    } catch (err) {
      alert('Error updating budget: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || 0), 0);
  const totalPending = budgets.reduce((acc, b) => acc + (b.pendingAmount || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>Fiscal Governance</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            University Department Budget Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor annual allocations, expenditures, and remaining balances per academic department
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* University Wide Budget Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Allocated Budget</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalAllocated.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">AY 2026-2027</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Amount Spent</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalAllocated ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}% Utilized
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Expenses</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Claims in approval pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Remaining Budget</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{totalRemaining.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Available liquidity</span>
        </div>
      </div>

      {/* Department Cards Grid (Directly mirroring PDF page 4 Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const spentPct = Math.min(100, Math.round((b.spentAmount / b.allocatedAmount) * 100));
          const remaining = b.allocatedAmount - b.spentAmount;

          return (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      {b.departmentId?.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {b.departmentId?.code}
                  </span>
                </div>

                <div className="space-y-2.5 my-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Budget:</span>
                    <strong className="text-slate-900 font-bold">
                      ₹{b.allocatedAmount?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Spent:</span>
                    <span className="text-blue-700 font-semibold">
                      ₹{b.spentAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pending Expenses:</span>
                    <span className="text-amber-600 font-semibold">
                      ₹{b.pendingAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-700 font-medium">Remaining Budget:</span>
                    <span className="text-emerald-700 font-bold">
                      ₹{remaining?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Utilization</span>
                    <span>{spentPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        spentPct > 85 ? 'bg-rose-500' : spentPct > 65 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${spentPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Edit Budget (for Admin / Finance / Registrar) */}
              {(user?.role === 'admin' || user?.role === 'registrar' || user?.role === 'finance') && (
                <button
                  onClick={() => {
                    setEditBudget(b);
                    setAllocatedInput(String(b.allocatedAmount));
                  }}
                  className="mt-3 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Allocation</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editBudget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Update Budget Allocation • {editBudget.departmentId?.name}
            </h3>
            <form onSubmit={handleUpdateBudget} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Annual Budget Allocation (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={allocatedInput}
                  onChange={(e) => setAllocatedInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditBudget(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

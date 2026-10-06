import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjectsApi, createProjectApi, getDepartmentsApi } from '../services/api';
import { FlaskConical, PlusCircle, CheckCircle2, AlertCircle, X, Layers, Cpu, Laptop, Compass, BookOpen, MoreHorizontal } from 'lucide-react';

export default function ResearchProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [budget, setBudget] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, deptRes] = await Promise.all([
        getProjectsApi(),
        getDepartmentsApi(),
      ]);
      setProjects(projRes.data);
      setDepartments(deptRes.data);
      if (deptRes.data.length > 0) {
        setDepartmentId(deptRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching research projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name || !code || !budget || !departmentId) return;

    try {
      await createProjectApi({
        name,
        code,
        departmentId,
        principalInvestigatorId: user._id,
        budget: Number(budget),
      });
      setIsModalOpen(false);
      setName('');
      setCode('');
      setBudget('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Sponsored Research Grants</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Research Project Sub-Budgets & Expenditures
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track grant allocations by line items: Equipment, Software, Travel, Research & Contingency
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Research Grant</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const breakdown = proj.breakdown || {};
          return (
            <div
              key={proj._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                {proj.code}
              </div>

              <div>
                <div className="pr-16 mb-2">
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PI: {proj.principalInvestigatorId?.name || 'Dr. Arun Kumar'} • Dept:{' '}
                    {proj.departmentId?.name || 'Computer Science'}
                  </p>
                </div>

                {/* Main Budget Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 my-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                      Total Grant Budget
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{proj.budget?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                      Remaining Funds
                    </span>
                    <span className="text-xl font-black text-emerald-600">
                      ₹{proj.remainingBudget?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Sub-Budget Category Breakdown (Exact from PDF Page 5) */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Line-Item Budget Breakdown (PDF Spec):
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Equipment */}
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Equipment</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{breakdown.equipment?.allocated?.toLocaleString('en-IN') || '3,00,000'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{breakdown.equipment?.spent?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>

                    {/* Software */}
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Software</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{breakdown.software?.allocated?.toLocaleString('en-IN') || '1,00,000'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{breakdown.software?.spent?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>

                    {/* Travel */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Travel</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{breakdown.travel?.allocated?.toLocaleString('en-IN') || '75,000'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{breakdown.travel?.spent?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>

                    {/* Research */}
                    <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold mb-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Research</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{breakdown.research?.allocated?.toLocaleString('en-IN') || '2,25,000'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{breakdown.research?.spent?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>

                    {/* Other */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        <span>Other</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{breakdown.other?.allocated?.toLocaleString('en-IN') || '50,000'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{breakdown.other?.spent?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>

                    {/* Remaining */}
                    <div className="p-3 bg-emerald-100/50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Remaining</span>
                      </div>
                      <div className="font-bold text-emerald-900">
                        ₹{proj.remainingBudget?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-700">Net unspent balance</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Status: <strong className="text-emerald-600">{proj.status}</strong></span>
                <span>Active Grant Funding Cycle</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Research Grant</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AI-Based Medical Image Analysis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grant Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. RES-AIMIA-2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grant Total Budget (₹) *</label>
                  <input
                    type="number"
                    min="1000"
                    placeholder="e.g. 1000000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hosting Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

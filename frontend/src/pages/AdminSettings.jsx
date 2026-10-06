import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsersApi, getDepartmentsApi, createDepartmentApi } from '../services/api';
import { Settings, Users, Building, Plus, CheckCircle2, Shield, UserCheck } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([getUsersApi(), getDepartmentsApi()]);
      setUsers(uRes.data);
      setDepartments(dRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    try {
      await createDepartmentApi({ name: newDeptName, code: newDeptCode });
      setMsg(`Department ${newDeptName} created.`);
      setNewDeptName('');
      setNewDeptCode('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Institutional Governance</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            System Administration & User Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic departments, manage role permissions, and system parameters
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grid: Departments & Create Dept */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Dept */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Add Academic Department</span>
          </h3>

          <form onSubmit={handleAddDept} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                placeholder="e.g. Civil Engineering"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
              <input
                type="text"
                placeholder="e.g. CIVIL"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              Save Department
            </button>
          </form>
        </div>

        {/* Existing Departments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Existing University Departments ({departments.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departments.map((d) => (
              <div key={d._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{d.name}</span>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px]">
                    {d.code}
                  </span>
                </div>
                <div className="text-slate-500 mt-1 text-[11px]">
                  HOD: {d.hodId?.name || 'Assigned via Department Head role'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Registered University Personnel ({users.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Employee ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Designation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-700">
                    {u.employeeId}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-6 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-6 py-3.5">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{u.departmentId?.name || 'University Central'}</td>
                  <td className="px-6 py-3.5 text-slate-500">{u.designation || 'Staff'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

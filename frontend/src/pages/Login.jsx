import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  GraduationCap,
  Building2,
  Shield,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('arun.kumar@university.edu');
  const [password, setPassword] = useState('FacultyUser@2026');
  const [error, setError] = useState('');
  const { login, switchDemoRole, loading } = useAuth();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    const res = await switchDemoRole(role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const demoAccounts = [
    { role: 'faculty', title: 'Faculty / Staff', name: 'Dr. Arun Kumar', icon: GraduationCap, color: 'blue' },
    { role: 'hod', title: 'Department Head (HOD)', name: 'Prof. Ramesh K. (CS)', icon: Building2, color: 'emerald' },
    { role: 'finance', title: 'Finance Officer & Auditor', name: 'Mr. Rajesh Gupta', icon: Landmark, color: 'amber' },
    { role: 'registrar', title: 'Registrar / Management', name: 'Prof. V. Raman', icon: Shield, color: 'indigo' },
    { role: 'admin', title: 'System Administrator', name: 'IT Director', icon: UserCheck, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4">
          <Landmark className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          University Expense Management
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Multi-Level Approval & Research Budget System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3 text-center">
              — Instant Demo 1-Click Role Access —
            </span>
            <div className="space-y-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickDemo(acc.role)}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {acc.title}
                        </div>
                        <div className="text-[11px] text-slate-500">{acc.name}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      Login →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
  PiggyBank,
  FlaskConical,
  BarChart3,
  Settings,
} from 'lucide-react';
import QuickRoleSwitcher from './QuickRoleSwitcher';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'faculty';

  const navItems = [
    {
      to: '/',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      roles: ['faculty', 'hod', 'finance', 'registrar', 'admin'],
    },
    {
      to: '/expenses',
      label: role === 'faculty' ? 'My Expense Claims' : 'All Expenses',
      icon: Receipt,
      roles: ['faculty', 'hod', 'finance', 'registrar', 'admin'],
    },
    {
      to: '/hod-approvals',
      label: 'HOD Department Review',
      icon: CheckCircle2,
      roles: ['hod', 'admin'],
      highlight: true,
    },
    {
      to: '/finance-audit',
      label: 'Finance Audit & Disbursal',
      icon: FileSearch,
      roles: ['finance', 'admin'],
      highlight: true,
    },
    {
      to: '/registrar-approvals',
      label: 'Registrar Authorization',
      icon: ShieldCheck,
      roles: ['registrar', 'admin'],
      highlight: true,
    },
    {
      to: '/budgets',
      label: 'University Budgets',
      icon: PiggyBank,
      roles: ['faculty', 'hod', 'finance', 'registrar', 'admin'],
    },
    {
      to: '/projects',
      label: 'Research Project Grants',
      icon: FlaskConical,
      roles: ['faculty', 'hod', 'finance', 'registrar', 'admin'],
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['hod', 'finance', 'registrar', 'admin'],
    },
    {
      to: '/admin',
      label: 'System Settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      <div className="p-4 lg:hidden border-b border-slate-800">
        <QuickRoleSwitcher />
      </div>

      <div className="p-4 flex-1 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation Menu
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1 bg-slate-950/40">
        <div className="font-semibold text-slate-200">ERP Academic Cycle</div>
        <div className="text-[11px] text-slate-500">AY 2026–2027 • Active Session</div>
        <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Database Connected (MongoDB)
        </div>
      </div>
    </aside>
  );
}

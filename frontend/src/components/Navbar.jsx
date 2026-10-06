import React from 'react';
import { useAuth } from '../context/AuthContext';
import QuickRoleSwitcher from './QuickRoleSwitcher';
import { LogOut, GraduationCap, Building2, Landmark, Shield, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: UserCheck };
      case 'hod':
        return { label: 'Head of Department', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Building2 };
      case 'finance':
        return { label: 'Finance Officer', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Landmark };
      case 'registrar':
        return { label: 'Registrar / Management', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Shield };
      case 'faculty':
      default:
        return { label: 'Faculty / Staff', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: GraduationCap };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              University Expense Management
            </h1>
            <p className="text-xs text-slate-500">
              Multi-Level Approval & Budget System
            </p>
          </div>
        </div>

        {/* Center: Quick Switcher */}
        <div className="hidden lg:flex items-center">
          <QuickRoleSwitcher />
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                <BadgeIcon className="w-2.5 h-2.5" />
                {badge.label}
              </span>
              {user?.departmentId && (
                <span className="text-[10px] text-slate-400">
                  • {user.departmentId.name || 'CS Dept'}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

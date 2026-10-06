import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, GraduationCap, Building2, Landmark } from 'lucide-react';

const roles = [
  { id: 'faculty', label: 'Faculty (Dr. Arun)', icon: GraduationCap, badge: 'Faculty' },
  { id: 'hod', label: 'HOD (Prof. Ramesh)', icon: Building2, badge: 'HOD - CS' },
  { id: 'finance', label: 'Finance (Mr. Rajesh)', icon: Landmark, badge: 'Finance' },
  { id: 'registrar', label: 'Registrar (Prof. Raman)', icon: Shield, badge: 'Registrar' },
  { id: 'admin', label: 'System Admin', icon: UserCheck, badge: 'Admin' },
];

export default function QuickRoleSwitcher() {
  const { user, switchDemoRole, loading } = useAuth();

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 hidden sm:inline">
        Quick Switch:
      </span>
      {roles.map((r) => {
        const Icon = r.icon;
        const isActive = user?.role === r.id;
        return (
          <button
            key={r.id}
            onClick={() => switchDemoRole(r.id)}
            disabled={loading || isActive}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-transparent'
            }`}
            title={`Switch to ${r.label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{r.badge}</span>
          </button>
        );
      })}
    </div>
  );
}

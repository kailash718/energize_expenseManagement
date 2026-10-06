import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, getExpensesApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching reports stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const deptData = stats?.departmentWiseSpend || [];
  const categoryData = stats?.categoryWise || [];
  const monthlyTrend = stats?.monthlyTrend || [
    { month: 'May 2026', totalSpend: 280000, claimCount: 14 },
    { month: 'Jun 2026', totalSpend: 420000, claimCount: 22 },
    { month: 'Jul 2026', totalSpend: 390000, claimCount: 19 },
    { month: 'Aug 2026', totalSpend: 610000, claimCount: 28 },
    { month: 'Sep 2026', totalSpend: 750000, claimCount: 35 },
    { month: 'Oct 2026', totalSpend: 800000, claimCount: 41 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Analytics & Audits</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Institutional Financial Reports & Trends
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental burn rates, monthly velocity, and category expense distributions
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary (PDF)</span>
        </button>
      </div>

      {/* Chart 1: Monthly Spending Trend (Area Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Monthly University Expenditure Run-Rate
            </h3>
            <p className="text-xs text-slate-500">
              Aggregate disburals approved across academic departments
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Spend']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="totalSpend"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSpend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts 2 & 3: Department Comparison & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Allocation vs Spent */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Department Allocation vs Spent
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comparison of allocated ceiling vs actual disbursed spend
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="allocated" name="Allocated" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Category Spending Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Proportionate outlay across academic research & campus operations
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

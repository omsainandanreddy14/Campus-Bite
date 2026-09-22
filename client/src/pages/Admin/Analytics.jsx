import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Award, Target, Heart } from 'lucide-react';

const Analytics = () => {
  const { orders } = useApp();

  const completed = orders.filter((o) => o.status === 'Delivered');
  const revenue = completed.reduce((sum, o) => sum + o.subtotal, 0);

  const totalOrdersCount = orders.length;
  const deliveredCount = completed.length;
  const rejectedCount = orders.filter((o) => o.status === 'Rejected').length;

  const conversionRate = totalOrdersCount > 0 
    ? Math.round((deliveredCount / totalOrdersCount) * 100) 
    : 100;

  const satisfactionScore = totalOrdersCount > 0 
    ? (5.0 - (rejectedCount / totalOrdersCount) * 2.0).toFixed(1) 
    : '5.0';

  const stats = [
    { label: 'Overall Conversion Rate', val: `${conversionRate}%`, desc: 'Successful checkouts', icon: Target, color: 'text-indigo-500' },
    { label: 'Customer Satisfaction', val: `${satisfactionScore}/5.0`, desc: 'Based on orders', icon: Heart, color: 'text-rose-500' },
    { label: 'Average Order Value', val: totalOrders() > 0 ? `₹${(revenue / totalOrders()).toFixed(2)}` : '₹0.00', desc: 'Basket size', icon: TrendingUp, color: 'text-emerald-500' }
  ];

  function totalOrders() {
    return completed.length;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Business Intelligence Reports</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform sales projections, transaction tallies, and service level times.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="pt-2">
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white block">{s.val}</span>
                <span className="text-xs text-slate-400 block mt-1">{s.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Global System Audit Logs</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-855/50 border-b border-slate-200/60 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Vendor Stall</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Sale Value</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Deliverer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Admin Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {completed.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/25">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{ord.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-350">{ord.canteen}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">₹{ord.subtotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-slate-550 font-bold">{ord.deliveryBoy || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{(ord.total - ord.subtotal - 20.00).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

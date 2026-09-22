import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { orders } = useApp();

  const completedOrders = orders.filter((o) => o.status === 'Delivered');

  // Stats calculation
  const totalOrdersCount = orders.length;
  const platformRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

  // Find unique students
  const uniqueStudents = new Set();
  orders.forEach((o) => uniqueStudents.add(o.customer));
  const totalStudentsCount = uniqueStudents.size;

  // Calculate most popular foods dynamically
  const foodStats = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      foodStats[item.name] = (foodStats[item.name] || 0) + item.quantity;
    });
  });

  const finalTopDishes = Object.entries(foodStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count], i) => ({
      name,
      count: `${count} orders`,
      pct: `${Math.min(100, Math.round((count / (orders.length || 1)) * 100))}%`,
      color: i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-emerald-500' : 'bg-indigo-500'
    }));

  // Hourly counts setup (mapping of hours dynamically)
  const hourBuckets = Array(7).fill(0); // 09:00 - 15:00
  orders.forEach((o) => {
    const hour = parseInt(o.time?.split(':')[0], 10);
    if (hour >= 9 && hour <= 15) {
      hourBuckets[hour - 9]++;
    } else {
      hourBuckets[3]++; // Default bucket (12:00)
    }
  });

  // Calculate Peak Delivery Window Dynamically
  const peakHourIndex = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakHour = peakHourIndex + 9;
  const formattedPeakHour = peakHour < 10 ? `0${peakHour}` : `${peakHour}`;
  const formattedNextHour = (peakHour + 1) < 10 ? `0${peakHour + 1}` : `${peakHour + 1}`;
  const peakWindowStr = orders.length > 0 ? `${formattedPeakHour}:00 - ${formattedNextHour}:00` : 'No Sales';

  const maxHourlyVal = Math.max(...hourBuckets, 1);
  const hourlyPercentages = orders.length === 0 
    ? Array(7).fill(0) 
    : hourBuckets.map((count) => (count / maxHourlyVal) * 85 + 15); // Scale between 15% and 100%

  const stats = [
    { label: 'Ordering Students', val: totalStudentsCount.toString(), icon: Users, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' },
    { label: 'Total Orders', val: totalOrdersCount.toString(), icon: ShoppingBag, color: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' },
    { label: 'Platform Sales', val: `₹${platformRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { label: 'Peak Delivery Window', val: peakWindowStr, icon: Clock, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Admin Home Page</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Oversee campus canteens, register delivery riders, configure platform features, and run global platform audits.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1 min-w-0">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block truncate">{s.label}</span>
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white block truncate">{s.val}</span>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Order Frequency (by Hour)</h3>
          {orders.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2.5">
              <AlertCircle className="h-7 w-7 text-slate-350" />
              <p className="text-xs text-slate-450">No transaction logs recorded for today yet.</p>
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between gap-2.5 pt-6">
              {hourlyPercentages.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    style={{ height: `${height}%` }} 
                    className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 group-hover:from-purple-650 group-hover:to-indigo-600 rounded-t-lg transition-all duration-300 relative shadow-sm"
                  >
                    <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-850 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold z-10">
                      {hourBuckets[i]} orders
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">0{i + 9}:00</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Dishes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Top Ordered Dishes</h3>
          {finalTopDishes.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2.5">
              <AlertCircle className="h-7 w-7 text-slate-350" />
              <p className="text-xs text-slate-450">No menu sales data recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {finalTopDishes.map((dish, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-850 dark:text-slate-250 truncate pr-4">{dish.name}</span>
                    <span className="text-slate-450 shrink-0">{dish.count}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: dish.pct }} className={`h-full rounded-full ${dish.color}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

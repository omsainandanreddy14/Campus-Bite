import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, ClipboardCheck, Clock, CheckCircle, X } from 'lucide-react';

const Orders = () => {
  const { orders, updateOrderStatus } = useApp();
  const { user } = useAuth();

  // Map canteen owner to their canteen stand dynamically
  const canteenName = user?.name || 'Campus Canteen';

  // Filter orders for this canteen
  const canteenOrders = orders.filter((o) => o.canteen === canteenName);

  const activeOrders = canteenOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Rejected');
  const pastOrders = canteenOrders.filter((o) => o.status === 'Delivered' || o.status === 'Rejected');

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Kitchen Order Queue</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Accept incoming orders, cook meals, and notify campus couriers.</p>
      </div>

      {/* Active Orders Queue */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Active Kitchen Orders</h3>
        {activeOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/40 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
              <ChefHat className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Active queue is clear</h3>
              <p className="text-slate-455 dark:text-slate-500 text-sm mt-1">Orders placed by campus students will appear here in real-time.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((ord) => (
              <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-855 dark:text-white text-base">{ord.id}</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                      ord.status === 'Preparing' 
                        ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-600' 
                        : ord.status === 'Ready for Pickup'
                          ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600'
                          : ord.status === 'Out for Delivery'
                            ? 'bg-indigo-50 dark:bg-indigo-955/20 text-indigo-650'
                            : 'bg-orange-50 dark:bg-orange-955/20 text-orange-600'
                    }`}>{ord.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {ord.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                  </p>
                  <p className="text-xs text-slate-450">Deliver to: <span className="font-medium text-slate-700 dark:text-slate-350">{ord.address} • Call: {ord.phone}</span></p>
                  {ord.cookingInstructions && (
                    <div className="mt-3 w-full border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/45 text-amber-900 dark:text-amber-200 p-4 rounded-xl shadow-sm text-sm font-semibold">
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-750 dark:text-amber-400 uppercase tracking-wider font-black mb-1">
                        <span>⚠️ Custom Chef Cooking Request</span>
                      </div>
                      <span className="text-sm font-black">"{ord.cookingInstructions}"</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-455 block">Dish Cost</span>
                    <span className="font-extrabold text-slate-850 dark:text-white text-lg">₹{ord.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    {ord.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                          className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                        >
                          <ChefHat className="h-4.5 w-4.5" />
                          <span>Accept & Cook</span>
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(ord.id, 'Rejected')}
                          className="px-3.5 py-2.5 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/10 flex items-center gap-1.5"
                        >
                          <X className="h-4.5 w-4.5" />
                          <span>Reject Order</span>
                        </button>
                      </>
                    )}
                    {ord.status === 'Preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(ord.id, 'Ready for Pickup')}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                      >
                        <ClipboardCheck className="h-4.5 w-4.5" />
                        <span>Ready for Rider</span>
                      </button>
                    )}
                    {ord.status === 'Ready for Pickup' && (
                      <span className="text-xs text-slate-400 font-semibold px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-450" />
                        <span>Awaiting Courier</span>
                      </span>
                    )}
                    {ord.status === 'Out for Delivery' && (
                      <span className="text-xs text-indigo-500 font-semibold px-3.5 py-2 bg-indigo-55 dark:bg-indigo-950/20 rounded-xl flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/30">
                        <Clock className="h-4 w-4 animate-bounce" />
                        <span>Courier Delivering</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Completed kitchen jobs</h3>
        {pastOrders.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-450 text-sm">No historical completions recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200/60 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Recipient</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Items</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 text-right uppercase">Dish Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {pastOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/20">
                      <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{ord.id}</span>
                          {ord.status === 'Rejected' && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-red-50 dark:bg-red-955/25 text-red-655 rounded-md border border-red-200/40 dark:border-red-900/35">Rejected</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-350">{ord.customer}</td>
                      <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-400">
                        <div>{ord.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}</div>
                        {ord.cookingInstructions && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic font-semibold">
                            Note: "{ord.cookingInstructions}"
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{ord.date} • {ord.time}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white text-right">
                        {ord.status === 'Rejected' ? <span className="line-through text-slate-400">₹{ord.subtotal.toFixed(2)}</span> : `₹${ord.subtotal.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

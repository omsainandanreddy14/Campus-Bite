import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clipboard, Printer } from 'lucide-react';
import { printDeliveryEarningsStatement } from '../../utils/generateInvoice';

const CompletedOrders = () => {
  const { orders } = useApp();
  const { user } = useAuth();

  const completedList = orders.filter((o) => o.status === 'Delivered' && o.deliveryBoy?.toLowerCase() === user?.name?.toLowerCase());
  const totalEarnings = completedList.length * 20.00;
  const totalKm = (completedList.length * 1.8).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Delivery History</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Check completed delivery gigs and historical payouts.</p>
        </div>

        {completedList.length > 0 && (
          <button
            onClick={() => printDeliveryEarningsStatement(user?.name || 'Delivery Partner', completedList, totalEarnings, totalKm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Download Earnings PDF</span>
          </button>
        )}
      </div>

      {completedList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-slate-150 dark:bg-slate-800/40 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Clipboard className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No deliveries completed</h3>
            <p className="text-slate-450 dark:text-slate-500 text-sm mt-1">Accept assignments and deliver them to see your completed log list.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {completedList.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-850 dark:text-white">{item.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.canteen}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.address}</p>
                  <p className="text-xs text-slate-400">Recipient: {item.customer} • Completed at {item.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Delivery Fee</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">+₹20.00</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedOrders;

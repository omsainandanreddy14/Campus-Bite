import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderChat from '../../components/OrderChat';
import RatingModal from '../../components/RatingModal';
import { printStudentInvoice } from '../../utils/generateInvoice';
import { Clock, CheckCircle2, ChevronRight, MapPin, Clipboard, MessageSquare } from 'lucide-react';

const Orders = () => {
  const { orders, reorderPastOrder } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [selectedRatingOrder, setSelectedRatingOrder] = useState(null);

  const [readCounts, setReadCounts] = useState(() => {
    const saved = sessionStorage.getItem('read_counts');
    return saved ? JSON.parse(saved) : {};
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('read_counts');
      if (saved) setReadCounts(JSON.parse(saved));
    };
    window.addEventListener('read_counts_updated', handleUpdate);
    return () => window.removeEventListener('read_counts_updated', handleUpdate);
  }, []);

  const handleOpenChat = (ord) => {
    setSelectedChatOrder(ord);
    const updated = { ...readCounts, [ord._id || ord.id]: ord.messages?.length || 0 };
    setReadCounts(updated);
    sessionStorage.setItem('read_counts', JSON.stringify(updated));
  };

  // Filter orders matching this student's name
  const studentOrders = orders.filter((o) => o.customer === user?.name);

  const getStatusColor = (status) => {
    const map = {
      Pending: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border border-orange-200/50 dark:border-orange-900/30',
      Preparing: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 border border-amber-200/50 dark:border-amber-900/30',
      'Ready for Pickup': 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50 dark:border-emerald-900/30',
      Accepted: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 border border-indigo-200/50 dark:border-indigo-900/30',
      'Out for Delivery': 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 border border-indigo-200/50 dark:border-indigo-900/30',
      'Payment Pending': 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 border border-orange-200/50 dark:border-orange-900/30',
      Delivered: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-750/30'
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  };

  const steps = ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status) => {
    if (status === 'Payment Pending') return 3;
    if (status === 'Accepted') return 3;
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Active Order Progress</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Check preparation and courier delivery states in real-time.</p>
      </div>

      {studentOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-slate-150 dark:bg-slate-800/40 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Clipboard className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No orders placed yet</h3>
            <p className="text-slate-450 dark:text-slate-500 text-sm mt-1">Your order logs will display here once you checkout items from the canteen.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {studentOrders.map((ord) => {
            const activeStep = getStepIndex(ord.status);
            return (
              <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-lg text-slate-850 dark:text-white">{ord.id}</span>
                      <span className="text-xs text-slate-400 font-medium">({ord.canteen})</span>
                    </div>
                    <span className="text-xs text-slate-400 block">Ordered at {ord.time} • {ord.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total paid</span>
                      <span className="font-extrabold text-slate-850 dark:text-white">₹{ord.total.toFixed(2)}</span>
                    </div>
                    {['Preparing', 'Ready for Pickup', 'Out for Delivery', 'Payment Pending'].includes(ord.status) && (
                      <button 
                        onClick={() => handleOpenChat(ord)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm relative"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                        {ord.messages?.length > (readCounts[ord._id || ord.id] || 0) && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                        )}
                      </button>
                    )}
                    {ord.status === 'Delivered' && (
                      <button 
                        onClick={() => printStudentInvoice(ord)}
                        className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-955/30 border border-indigo-200/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        title="Download Tax Invoice PDF"
                      >
                        <span>📄 Invoice PDF</span>
                      </button>
                    )}
                    {ord.status === 'Delivered' && (
                      <button 
                        onClick={() => {
                          reorderPastOrder(ord);
                          navigate('/student/cart');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <span>🔄 Order Again</span>
                      </button>
                    )}
                    {ord.status === 'Delivered' && (!ord.isReviewed || !ord.isRiderReviewed) && (
                      <button 
                        onClick={() => setSelectedRatingOrder(ord)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-orange-500/10 flex items-center gap-1"
                      >
                        ⭐️ Rate Order
                      </button>
                    )}
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${getStatusColor(ord.status)}`}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar timeline */}
                {ord.status !== 'Delivered' && (
                  <div className="py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-6">Live status timeline</span>
                    <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                      {/* Horizontal progress bar */}
                      <div className="absolute left-[15px] top-[15px] bottom-0 md:left-0 md:right-0 md:bottom-auto md:top-[14px] h-full w-[2px] md:h-[2px] md:w-full bg-slate-100 dark:bg-slate-800 -z-0" />
                      <div 
                        className="absolute left-[15px] top-[15px] md:left-0 md:top-[14px] w-[2px] md:h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 -z-0" 
                        style={{ 
                          height: window.innerWidth < 768 ? `${(activeStep / (steps.length - 1)) * 100}%` : '2px',
                          width: window.innerWidth >= 768 ? `${(activeStep / (steps.length - 1)) * 100}%` : '2px'
                        }}
                      />

                      {steps.map((step, idx) => {
                        const isDone = idx <= activeStep;
                        const isCurrent = idx === activeStep;
                        return (
                          <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 md:w-1/5 relative">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-500/10' 
                                : isDone 
                                  ? 'bg-orange-500 border-orange-500 text-white' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}>
                              {isDone ? <CheckCircle2 className="h-4.5 w-4.5" /> : idx + 1}
                            </div>
                            <div className="text-left md:text-center min-w-0">
                              <span className={`text-xs font-bold block ${isCurrent ? 'text-orange-500' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{step}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block hidden md:block">
                                {idx === 0 ? 'Placed' : idx === 1 ? 'Cooking' : idx === 2 ? 'Dispatched' : idx === 3 ? 'Courier' : 'Handover'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items description list */}
                <div className="bg-slate-50 dark:bg-slate-850/50 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Order details</span>
                  <div className="space-y-1.5 text-sm">
                    {ord.items.map((ci) => (
                      <div key={ci.id} className="flex justify-between font-medium">
                        <span className="text-slate-650 dark:text-slate-350">{ci.quantity}x {ci.name}</span>
                        <span className="text-slate-850 dark:text-white font-semibold">₹{(ci.price * ci.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200/50 dark:border-slate-800 mt-2 pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{ord.address}</span>
                    </span>
                    <span>Paid via Wallet</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Chat Panel */}
      {selectedChatOrder && (
        <OrderChat 
          order={orders.find((o) => o.id === selectedChatOrder.id)}
          role="student"
          isOpen={!!selectedChatOrder}
          onClose={() => setSelectedChatOrder(null)}
        />
      )}

      {/* Floating Rating Modal */}
      {selectedRatingOrder && (
        <RatingModal 
          order={orders.find((o) => o.id === selectedRatingOrder.id)}
          isOpen={!!selectedRatingOrder}
          onClose={() => setSelectedRatingOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;

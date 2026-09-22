import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Flame, MapPin, Star, Plus, ArrowLeft, Store, AlertTriangle, Wallet, CreditCard, MessageSquare } from 'lucide-react';
import OrderChat from '../../components/OrderChat';

const StudentDashboard = () => {
  const { foods, addToCart, canteenStatuses, orders, payOrder, cart, updateCartQuantity, vouchers } = useApp();
  const { user, deposit } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  
  // Wallet Top-up modal states
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  // Chat states
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [readCounts, setReadCounts] = useState(() => {
    const saved = sessionStorage.getItem('read_counts');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
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

  const [dismissedRejections, setDismissedRejections] = useState(() => {
    const saved = sessionStorage.getItem('dismissed_rejections');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('dismissed_rejections', JSON.stringify(dismissedRejections));
  }, [dismissedRejections]);

  const studentRejectedOrders = orders.filter((o) => 
    o.status === 'Rejected' && !dismissedRejections.includes(o.id)
  );

  const dismissRejection = (orderId) => {
    setDismissedRejections((prev) => [...prev, orderId]);
  };

  const categories = ['All', 'Burgers', 'Pizza', 'Biryani', 'Drinks', 'Desserts', 'Snacks'];

  const getCanteenStatus = (canteenName) => {
    const match = canteenStatuses.find((c) => c.name === canteenName);
    return match ? (match.status === 'Suspended' || match.kitchenStatus === 'Closed' ? 'Closed' : 'Open') : 'Open';
  };

  const getCanteenActiveOrdersCount = (canteenName) => {
    return orders.filter((o) => o.canteen === canteenName && ['Pending', 'Preparing'].includes(o.status)).length;
  };

  const getCanteenPrepSpeed = (canteenName) => {
    const activePrepCount = orders.filter(o => 
      o.canteen.toLowerCase() === canteenName.toLowerCase() && 
      (o.status === 'Placed' || o.status === 'Preparing')
    ).length;

    if (activePrepCount >= 5) {
      return {
        label: 'Rush Hour',
        eta: '25-30 mins',
        style: 'bg-red-50 dark:bg-red-955/20 text-red-600 border-red-200/50 dark:border-red-900/30'
      };
    } else if (activePrepCount >= 2) {
      return {
        label: 'Steady Queue',
        eta: '18-22 mins',
        style: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 border-amber-200/50 dark:border-amber-900/30'
      };
    } else {
      return {
        label: 'Relaxed Prep',
        eta: '12-15 mins',
        style: 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/30'
      };
    }
  };

  // Compile canteen objects
  const canteensList = canteenStatuses.map((cant, i) => {
    const activeCount = getCanteenActiveOrdersCount(cant.name);
    const eta = 15 + activeCount * 3;
    return {
      name: cant.name,
      status: cant.status === 'Suspended' || cant.kitchenStatus === 'Closed' ? 'Closed' : 'Open',
      location: 'Campus Dining Hall',
      rating: (4.4 + (i * 0.1) % 0.5).toFixed(1),
      time: `${eta} mins`,
      announcement: cant.announcement || '',
      specialDishId: cant.specialDishId || '',
      specialDishPrice: cant.specialDishPrice || 0,
      customSpecialDishName: cant.customSpecialDishName || '',
      customSpecialDishPrice: cant.customSpecialDishPrice || 0,
      specialDishes: cant.specialDishes || []
    };
  });

  const currentCanteenObj = selectedCanteen 
    ? canteensList.find((c) => c.name.toLowerCase() === selectedCanteen.toLowerCase())
    : null;

  let specials = [];
  if (currentCanteenObj) {
    if (currentCanteenObj.specialDishes && currentCanteenObj.specialDishes.length > 0) {
      specials = currentCanteenObj.specialDishes;
    } else if (currentCanteenObj.specialDishId || currentCanteenObj.customSpecialDishName) {
      specials = [{
        dishId: currentCanteenObj.specialDishId || '',
        dishPrice: currentCanteenObj.specialDishPrice || 0,
        customName: currentCanteenObj.customSpecialDishName || '',
        customPrice: currentCanteenObj.customSpecialDishPrice || 0
      }];
    }
  }

  // Filter canteens list by search query if in selection mode
  const filteredCanteens = canteensList.filter((cant) => 
    cant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter food items belonging to the selected canteen (case-insensitive)
  const availableFoods = foods.filter((f) => f.available && f.canteen && selectedCanteen && f.canteen.toLowerCase() === selectedCanteen.toLowerCase());

  // Filter by category and search query within selected canteen menu
  const filteredFoods = availableFoods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelectedCanteenClosed = selectedCanteen ? getCanteenStatus(selectedCanteen) === 'Closed' : false;

  return (
    <div className="space-y-8 pb-12">
      {/* Rejected Orders Alerts */}
      {studentRejectedOrders.length > 0 && (
        <div className="space-y-3">
          {studentRejectedOrders.map((ord) => (
            <div 
              key={ord.id} 
              className="p-4 bg-red-50 dark:bg-red-955/25 border border-red-200 dark:border-red-900/35 rounded-2xl flex items-center justify-between text-red-655 shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Order Rejected</p>
                  <p className="opacity-90">Your order <span className="font-semibold">{ord.id}</span> has been rejected by {ord.canteen} due to some reasons.</p>
                </div>
              </div>
              <button 
                onClick={() => dismissRejection(ord.id)}
                className="text-xs font-bold bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/35 px-3 py-1 rounded-xl hover:bg-red-50 transition-all shrink-0 pl-3 ml-3"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Pending Payment Dialog */}
      {(() => {
        const pendingPaymentOrders = orders.filter((o) => o.status === 'Payment Pending' && o.customer === user?.name);
        if (pendingPaymentOrders.length === 0) return null;
        return (
          <div className="space-y-4">
            {pendingPaymentOrders.map((ord) => {
              const hasEnoughWallet = user?.wallet >= ord.total;
              return (
                <div 
                  key={ord.id} 
                  className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-950/45 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden"
                >
                  {/* Decorative glow */}
                  <div className="absolute -right-16 -top-16 h-36 w-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row gap-6 items-center min-w-0 flex-1">
                    {/* Mock Payment QR Code Box */}
                    <div className="h-28 w-28 bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
                      {/* Visual QR Code Representation using clean CSS grid */}
                      <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-transparent" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                        <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
                      </div>
                      <span className="text-[7px] text-slate-400 font-bold uppercase mt-1">Scan to Pay</span>
                    </div>

                    <div className="space-y-2 min-w-0 text-center sm:text-left">
                      <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-605 border border-orange-200 dark:border-orange-900/30">
                        Courier Awaiting Payment
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-855 dark:text-white leading-tight">Pay for Order {ord.id}</h3>
                      <p className="text-xs text-slate-450 dark:text-slate-400">
                        Dishes: <span className="font-bold text-slate-700 dark:text-slate-300">₹{ord.subtotal.toFixed(2)}</span> • Platform: <span className="font-semibold text-slate-700 dark:text-slate-300">₹10.00</span> • Delivery: <span className="font-semibold text-slate-700 dark:text-slate-300">₹30.00</span>
                      </p>
                      <p className="text-sm font-black text-orange-500">
                        Total Payable: ₹{ord.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto text-center">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Wallet Balance: <span className={hasEnoughWallet ? 'text-emerald-500' : 'text-red-500'}>₹{user?.wallet?.toFixed(2) || '0.00'}</span>
                    </span>
                    
                    {hasEnoughWallet ? (
                      <button 
                        onClick={() => payOrder(ord.id)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Pay ₹{ord.total.toFixed(2)} from Wallet</span>
                      </button>
                    ) : (
                      <div className="text-center space-y-1">
                        <div className="px-4 py-2.5 bg-red-55/10 border border-red-200/40 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-wider">
                          Insufficient Wallet Balance!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Live Order Tracker */}
      {(() => {
        const activeOrder = orders
          .filter(o => o.customer === user?.name && o.status !== 'Delivered' && o.status !== 'Rejected' && o.status !== 'Cancelled')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (!activeOrder) return null;

        const statusSteps = ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];
        
        const getStatusStepIdx = (status) => {
          switch (status) {
            case 'Pending':
              return 0;
            case 'Preparing':
              return 1;
            case 'Ready for Pickup':
              return 2;
            case 'Accepted':
            case 'Out for Delivery':
            case 'Payment Pending':
              return 3;
            case 'Delivered':
              return 4;
            default:
              return 0;
          }
        };

        const currentStepIdx = getStatusStepIdx(activeOrder.status);

        const statusHelpText = {
          Pending: 'Canteen has received your order and is reviewing it...',
          Preparing: 'Chef is preparing your hot meal fresh in the kitchen!',
          'Ready for Pickup': 'Chef has finished preparing! Awaiting courier pickup...',
          Accepted: 'Courier has accepted your order and is heading to the canteen!',
          'Out for Delivery': 'Courier has picked up your food and is on the way to your hostel!',
          'Payment Pending': 'Courier has arrived! Complete payment above to collect your order.',
          Delivered: 'Order completed. Enjoy your meal!'
        }[activeOrder.status] || 'Order is in progress...';

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden animate-fade-in">
            <div className="absolute -right-16 -top-16 h-36 w-36 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-36 w-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-955 text-orange-605 uppercase tracking-wider block w-fit">
                  Live Order Tracker
                </span>
                <h4 className="font-extrabold text-base text-slate-855 dark:text-white mt-1.5">
                  Order from {activeOrder.canteen} <span className="text-slate-400 font-medium">#{activeOrder.id}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {activeOrder.items?.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                <span className="text-sm font-black text-slate-850 dark:text-slate-200 block">₹{activeOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="relative pt-2">
              <div className="absolute top-[21px] left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full pointer-events-none">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(Math.max(0, currentStepIdx) / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step} className="flex flex-col items-center text-center w-16">
                      <div 
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-emerald-500 text-white' 
                            : isCurrent 
                              ? 'bg-orange-500 text-white animate-pulse scale-110 shadow-orange-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] font-extrabold mt-2.5 transition-colors ${
                        isCompleted 
                          ? 'text-emerald-500' 
                          : isCurrent 
                            ? 'text-orange-500' 
                            : 'text-slate-450 dark:text-slate-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850/60 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🚀</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 italic font-bold">"{statusHelpText}"</p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenChat(activeOrder)}
                className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-955/30 border border-indigo-200/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer relative shrink-0"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{activeOrder.deliveryBoy ? `Chat with ${activeOrder.deliveryBoy.split(' ')[0]} (Rider)` : 'Chat with Delivery Partner'}</span>
                {activeOrder.messages?.length > (readCounts[activeOrder._id || activeOrder.id] || 0) && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-555 rounded-full animate-ping" />
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {/* 1. SELECTION MODE: Canteen List view */}
      {selectedCanteen === null ? (
        <>
          {/* Welcome, Wallet & Search Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-855 dark:text-white">Hey, {user?.name || 'Student'}! 👋</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">What kitchen are we exploring today?</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-sm shrink-0 animate-pulse">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Wallet Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">₹{user?.wallet?.toFixed(2) || '0.00'}</span>
                    {user?.wallet < 100 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-250/20 animate-pulse">LOW</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setTopUpModalOpen(true)}
                  className="ml-2 text-[10px] font-black text-orange-500 hover:text-orange-600 transition-colors uppercase border-0 bg-transparent cursor-pointer hover:underline"
                >
                  ➕ Top up
                </button>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search canteens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-800 dark:text-slate-100 transition-all text-sm shadow-inner"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Promos */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-6 shadow-xl shadow-emerald-600/10 flex items-center justify-between">
            <div className="space-y-2 max-w-[65%]">
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider">Quick Deliveries</span>
              <h3 className="text-2xl font-extrabold">Instant Hostel Drop</h3>
              <p className="text-sm opacity-90">Hostels A, B, and C average delivery times are under 15 minutes today!</p>
            </div>
            <MapPin className="h-20 w-20 text-white/10 absolute right-4 top-2 pointer-events-none" />
          </div>

          {/* Nearby Canteens Grid Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-500" />
              <span>Campus Canteen Stalls</span>
            </h3>

            {filteredCanteens.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3">
                <AlertTriangle className="h-10 w-10 text-slate-350 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-white">No canteens found</h4>
                <p className="text-xs text-slate-400">There are no canteen stalls matching your query or registered on campus yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCanteens.map((cant, idx) => {
                  const isClosed = cant.status === 'Closed';
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedCanteen(cant.name);
                        setSearchQuery(''); // Clear search query for menu view
                        setSelectedCategory('All'); // Reset category
                      }}
                      className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-orange-500/40 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group ${
                        isClosed ? 'opacity-75' : ''
                      }`}
                    >
                      {/* Decorative Background icon */}
                      <Store className="h-28 w-28 text-slate-50 dark:text-slate-950 absolute -right-4 -bottom-4 group-hover:scale-105 transition-transform duration-350 opacity-40 pointer-events-none" />

                      <div className="space-y-2 z-10">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-lg border ${
                            isClosed 
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-655 border-red-200/50 dark:border-red-900/30' 
                              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/30'
                          }`}>{cant.status}</span>
                          
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50/50 dark:bg-amber-950/25 px-2 py-0.5 rounded-lg">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span>{cant.rating}</span>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 group-hover:text-orange-500 transition-colors pt-2">
                          {cant.name ? (cant.name.charAt(0).toUpperCase() + cant.name.slice(1)) : 'Canteen'}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{cant.location}</span>
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex flex-col gap-1.5 z-10">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Prep Speed:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${getCanteenPrepSpeed(cant.name).style}`}>
                            {getCanteenPrepSpeed(cant.name).label} ({getCanteenPrepSpeed(cant.name).eta})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>Explore Menu</span>
                          <span className="font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* 2. MENU MODE: Canteen Specific Menu view */
        <>
          {/* Menu Header with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCanteen(null)}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all text-slate-650 dark:text-slate-350 shadow-sm"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-855 dark:text-white">{selectedCanteen} Menu</h2>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${
                    isSelectedCanteenClosed 
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-655 border-red-200/50 dark:border-red-900/30' 
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/30'
                  }`}>{isSelectedCanteenClosed ? 'Closed' : 'Open'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Prep Speed: <span className="font-extrabold text-orange-500">{getCanteenPrepSpeed(selectedCanteen).eta}</span>
                  </p>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-wider ${getCanteenPrepSpeed(selectedCanteen).style}`}>
                    {getCanteenPrepSpeed(selectedCanteen).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-800 dark:text-slate-100 transition-all text-sm shadow-sm"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Canteen Announcement Board */}
          {specials.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-955/5 dark:to-orange-955/5 border border-amber-200/50 dark:border-amber-900/35 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 animate-bounce">
                  📢
                </div>
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[9px] text-amber-600 dark:text-amber-500 block">Today's Specials</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Special prices on delicious chef selections today only!</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {specials.map((spec, idx) => {
                  const isCustom = !!spec.customName;
                  const specialFoodItem = !isCustom && spec.dishId 
                    ? foods.find((f) => (f._id === spec.dishId || f.id === spec.dishId))
                    : null;
                  
                  const promoPrice = isCustom 
                    ? spec.customPrice 
                    : (spec.dishPrice > 0 
                      ? spec.dishPrice 
                      : (specialFoodItem ? specialFoodItem.price : 0));

                  const specialName = isCustom 
                    ? spec.customName 
                    : (specialFoodItem ? specialFoodItem.name : 'Featured Dish');

                  const handleAddSpecialToCart = () => {
                    if (isCustom) {
                      const customItem = {
                        _id: `custom_special_${currentCanteenObj.name.replace(/\s+/g, '_')}_${idx}`,
                        name: specialName,
                        price: promoPrice,
                        quantity: 1,
                        canteen: currentCanteenObj.name,
                        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
                        isVeg: true,
                        isCustomSpecial: true
                      };
                      addToCart(customItem);
                    } else if (specialFoodItem) {
                      const modifiedItem = {
                        ...specialFoodItem,
                        price: promoPrice // Apply the promo price!
                      };
                      addToCart(modifiedItem);
                    }
                  };

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-amber-205/30 dark:border-amber-900/15 p-4 rounded-2xl flex justify-between items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black uppercase rounded bg-orange-100 dark:bg-orange-955 text-orange-605 px-1.5 py-0.5">
                          {isCustom ? 'Custom Promo' : 'Featured Deal'}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate mt-1.5 leading-snug">{specialName}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                          <span className="text-base font-black text-orange-500 block">₹{promoPrice}</span>
                        </div>
                        
                        {!isSelectedCanteenClosed && (() => {
                          const itemId = isCustom 
                            ? `custom_special_${currentCanteenObj.name.replace(/\s+/g, '_')}_${idx}`
                            : (specialFoodItem?._id || specialFoodItem?.id);
                          const cartItem = cart.find(ci => ci.id === itemId || ci._id === itemId);
                          const currentQty = cartItem ? cartItem.quantity : 0;

                          if (currentQty > 0) {
                            return (
                              <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-955/20 border border-orange-200/30 rounded-xl px-1.5 py-1 shadow-sm shrink-0">
                                <button
                                  onClick={() => updateCartQuantity(itemId, currentQty - 1)}
                                  className="h-6 w-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-orange-605 dark:text-orange-400 min-w-[12px] text-center font-mono">{currentQty}</span>
                                <button
                                  onClick={() => updateCartQuantity(itemId, currentQty + 1)}
                                  className="h-6 w-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                >
                                  +
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              onClick={handleAddSpecialToCart}
                              className="h-9 w-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-orange-500/10 cursor-pointer text-sm font-bold active:scale-95"
                              title="Add to Cart"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Closed Canteen Warnings */}
          {isSelectedCanteenClosed && (
            <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/35 rounded-2xl flex gap-3 text-red-655">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Canteen Kitchen is Temporarily Closed</p>
                <p className="opacity-90">This canteen stall has closed its kitchen. You can still browse their menu items, but you cannot add them to your cart or place orders right now.</p>
              </div>
            </div>
          )}

          {/* Canteen Available Offers */}
          {(() => {
            const canteenCoupons = (vouchers || []).filter(v => v.isActive && (!v.canteen || v.canteen === selectedCanteen) && (!v.excludedCanteens || !v.excludedCanteens.includes(selectedCanteen)));
            if (canteenCoupons.length === 0) return null;
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Active Offers & Promo Codes</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {canteenCoupons.map((coupon) => (
                    <div 
                      key={coupon._id || coupon.id} 
                      className="bg-white dark:bg-slate-900 border border-orange-200/50 dark:border-orange-950/40 p-4 rounded-2xl flex flex-col justify-between shrink-0 w-64 shadow-sm relative overflow-hidden group hover:border-orange-500 transition-colors"
                    >
                      <div className="absolute -right-8 -top-8 h-16 w-16 bg-orange-500/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-300" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-100 dark:bg-orange-955 text-orange-655 font-black text-xs px-2 py-0.5 rounded-lg border border-orange-200/20">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {coupon.discount}% OFF
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold">
                          {coupon.minCartValue > 0 ? `Min. order: ₹${coupon.minCartValue}` : 'No minimum order'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-450 font-extrabold uppercase">
                          {coupon.canteen ? 'Stall Offer' : 'Platform Offer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Filter Categories</h3>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Canteen Dish Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span>Available Dishes</span>
            </h3>

            {filteredFoods.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 max-w-xl mx-auto space-y-2">
                <p className="text-slate-450 text-sm font-semibold">No food items found</p>
                <p className="text-xs text-slate-400">There are no dishes matching the selected filter in this canteen.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoods.map((food) => {
                  const foodSpecial = specials.find(spec => !spec.customName && (spec.dishId === food._id || spec.dishId === food.id));
                  const displayPrice = foodSpecial ? foodSpecial.dishPrice : food.price;
                  return (
                    <div 
                      key={food._id} 
                      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden group hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 ${
                        isSelectedCanteenClosed ? 'opacity-70' : ''
                      }`}
                    >
                    <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                      <img 
                        src={food.img} 
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {isSelectedCanteenClosed ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-650 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow">Closed</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1.5 rounded-xl shadow flex flex-col items-center gap-0.5 min-w-[52px]">
                          {food.ratingCount > 0 ? (
                            <>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-2.5 w-2.5 ${
                                      star <= Math.round(food.rating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : star - 0.5 <= food.rating
                                          ? 'text-amber-400 fill-amber-200'
                                          : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 leading-none">{food.rating.toFixed(1)}</span>
                              <span className="text-[8px] text-slate-400 font-medium leading-none">{food.ratingCount} {food.ratingCount === 1 ? 'review' : 'reviews'}</span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(s => <Star key={s} className="h-2.5 w-2.5 text-slate-300 dark:text-slate-700" />)}
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 leading-none">New</span>
                              <span className="text-[8px] text-slate-400 font-medium leading-none">0 reviews</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">{food.canteen}</p>
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Indicator Icon */}
                        <span className={`h-4 w-4 border flex items-center justify-center rounded shrink-0 ${
                          food.isVeg 
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' 
                            : 'border-red-600 bg-red-50 dark:bg-red-955/20'
                        }`} title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                          <span className={`h-2 w-2 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-red-700'}`} />
                        </span>
                        <h4 className="font-bold text-slate-855 dark:text-slate-100 group-hover:text-orange-500 transition-colors line-clamp-1">{food.name}</h4>
                        {foodSpecial && (
                          <span className="text-[8px] font-black uppercase rounded bg-orange-100 dark:bg-orange-955 text-orange-605 px-1.5 py-0.5 shrink-0 animate-pulse">Special</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-slate-950 dark:text-white font-mono">₹{displayPrice.toFixed(2)}</span>
                          {foodSpecial && (
                            <span className="text-xs text-slate-450 dark:text-slate-500 line-through">₹{food.price.toFixed(2)}</span>
                          )}
                        </div>
                        {!isSelectedCanteenClosed && (() => {
                          const itemId = food._id || food.id;
                          const cartItem = cart.find(ci => ci.id === itemId || ci._id === itemId);
                          const currentQty = cartItem ? cartItem.quantity : 0;

                          if (currentQty > 0) {
                            return (
                              <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-955/20 border border-orange-200/30 rounded-xl px-1.5 py-1 shadow-sm shrink-0">
                                <button
                                  onClick={() => updateCartQuantity(itemId, currentQty - 1)}
                                  className="h-6 w-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-orange-605 dark:text-orange-400 min-w-[12px] text-center font-mono">{currentQty}</span>
                                <button
                                  onClick={() => updateCartQuantity(itemId, currentQty + 1)}
                                  className="h-6 w-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                >
                                  +
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button 
                              onClick={() => addToCart({ ...food, price: displayPrice })}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm bg-orange-100 dark:bg-orange-955/40 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-orange-605 dark:text-orange-400 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          );
                        })()}
                        {isSelectedCanteenClosed && (
                          <button 
                            disabled
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-400 border border-slate-200 dark:border-slate-850 cursor-not-allowed"
                          >
                            Closed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </div>
        </>
      )}

      {/* Wallet Quick Top-up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute -right-12 -top-12 h-28 w-28 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-2">
              <h4 className="font-extrabold text-slate-855 dark:text-white text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <span>Quick Wallet Top-up</span>
              </h4>
              <button
                onClick={() => { setTopUpModalOpen(false); setTopUpAmount(''); }}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 text-lg cursor-pointer bg-transparent border-0"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-505 dark:text-slate-400 font-medium">Add funds instantly to complete checkout. Current balance: <span className="font-bold text-slate-700 dark:text-slate-300">₹{user?.wallet?.toFixed(2)}</span></p>

            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount, e.g., 200"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="auth-input text-sm py-2.5 px-4 rounded-2xl w-full"
                />
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 505].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 text-xs font-extrabold rounded-xl border border-slate-200/50 dark:border-slate-800/80 transition-all cursor-pointer"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={topUpLoading}
                onClick={async () => {
                  const amt = parseFloat(topUpAmount);
                  if (isNaN(amt) || amt <= 0) {
                    alert('Please enter a valid deposit amount.');
                    return;
                  }
                  setTopUpLoading(true);
                  const res = await deposit(amt);
                  if (res.success) {
                    alert(`Successfully deposited ₹${amt.toFixed(2)} to your wallet!`);
                    setTopUpModalOpen(false);
                    topUpAmount && setTopUpAmount('');
                  } else {
                    alert(res.error || 'Failed to deposit money.');
                  }
                  setTopUpLoading(false);
                }}
                className="btn-primary w-full py-3 text-xs font-extrabold rounded-2xl flex justify-center items-center gap-1.5 shadow-md shadow-orange-500/10"
              >
                <span>{topUpLoading ? 'Processing...' : 'Confirm & Deposit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Order Chat Panel */}
      {selectedChatOrder && (
        <OrderChat 
          order={orders.find((o) => o.id === selectedChatOrder.id)}
          role="student"
          isOpen={!!selectedChatOrder}
          onClose={() => setSelectedChatOrder(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;

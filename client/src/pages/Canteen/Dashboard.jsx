import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, DollarSign, ArrowUpRight, Clock, Star, Calendar, Megaphone, MessageSquare, ChefHat, TrendingUp, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OrderChat from '../../components/OrderChat';

const CanteenDashboard = () => {
  const { foods, orders, updateCanteenAnnouncement, fetchCanteenReviews, updateOrderStatus, vouchers, createVoucher, deleteVoucher } = useApp();
  const { user, updateUser } = useAuth();

  const canteenName = user?.name || 'Campus Canteen';
  const isSuspended = user?.status === 'Suspended';
  const kitchenStatus = user?.kitchenStatus || 'Open';
  const isClosed = kitchenStatus === 'Closed' || isSuspended;

  const announcementText = '';
  const [selectedDishId, setSelectedDishId] = useState(user?.specialDishId || '');
  const [activeSpecialsList, setActiveSpecialsList] = useState(user?.specialDishes || []);
  const [specialPrice, setSpecialPrice] = useState(user?.specialDishPrice || '');
  const [updatingAnnouncement, setUpdatingAnnouncement] = useState(false);
  const [ratingsSummary, setRatingsSummary] = useState([]);
  const [ordersTab, setOrdersTab] = useState('New');

  // Custom special dish states
  const [isCustomMode, setIsCustomMode] = useState(!!user?.customSpecialDishName);
  const [customDishName, setCustomDishName] = useState(user?.customSpecialDishName || '');
  const [customDishPrice, setCustomDishPrice] = useState(user?.customSpecialDishPrice || '');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Chat notification states
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

  const canteenFoods = foods.filter((f) => f.canteen && f.canteen.toLowerCase() === canteenName.toLowerCase());

  useEffect(() => {
    const loadRatingsSummary = async () => {
      const token = sessionStorage.getItem('token');
      const res = await api.foods.getRatingsSummary(canteenName, token);
      if (res.success) setRatingsSummary(res.summary || []);
    };
    loadRatingsSummary();
    // Poll every 5 seconds to keep summary updated
    const interval = setInterval(loadRatingsSummary, 5000);
    return () => clearInterval(interval);
  }, [canteenName]);

  const handleAddDirectSpecial = async (e) => {
    if (e) e.preventDefault();

    const dishId = isCustomMode ? '' : selectedDishId;
    const price = isCustomMode ? 0 : (parseFloat(specialPrice) || 0);
    const custName = isCustomMode ? customDishName.trim() : '';
    const custPrice = isCustomMode ? (parseFloat(customDishPrice) || 0) : 0;

    if (!isCustomMode && !dishId) {
      alert('Please select a dish from the menu.');
      return;
    }
    if (!isCustomMode && (!price || price <= 0)) {
      alert('Please enter a valid promo price.');
      return;
    }
    if (isCustomMode && (!custName || !custPrice || custPrice <= 0)) {
      alert('Please specify the custom dish name and a valid price.');
      return;
    }

    const newSpecial = isCustomMode
      ? { dishId: '', dishPrice: 0, customName: custName, customPrice: custPrice }
      : { dishId, dishPrice: price, customName: '', customPrice: 0 };

    const currentList = user?.specialDishes || [];
    
    // Check duplicate
    const isDuplicate = currentList.some(item => 
      isCustomMode 
        ? item.customName?.toLowerCase() === custName.toLowerCase() 
        : item.dishId === dishId
    );

    if (isDuplicate) {
      alert('This dish is already in your active Today\'s Specials.');
      return;
    }

    const updatedList = [...currentList, newSpecial];

    setUpdatingAnnouncement(true);
    const first = updatedList[0];
    const res = await updateCanteenAnnouncement(
      '', 
      first.dishId || '', 
      first.dishPrice || 0, 
      first.customName || '', 
      first.customPrice || 0,
      updatedList
    );

    if (res.success) {
      updateUser({ 
        announcement: res.announcement,
        specialDishId: res.specialDishId,
        specialDishPrice: res.specialDishPrice,
        customSpecialDishName: res.customSpecialDishName,
        customSpecialDishPrice: res.customSpecialDishPrice,
        specialDishes: res.specialDishes
      });
      setActiveSpecialsList(res.specialDishes || []);
      setSelectedDishId('');
      setSpecialPrice('');
      setCustomDishName('');
      setCustomDishPrice('');
      setPromoSuccessMsg('Dish added directly to Today\'s Specials! ✨');
      setTimeout(() => setPromoSuccessMsg(''), 4000);
    } else {
      alert(res.error || 'Failed to add special dish.');
    }
    setUpdatingAnnouncement(false);
  };

  const handleRemoveDirectSpecial = async (indexToRemove) => {
    const currentList = user?.specialDishes || [];
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);

    setUpdatingAnnouncement(true);
    const first = updatedList.length > 0 ? updatedList[0] : { dishId: '', dishPrice: 0, customName: '', customPrice: 0 };
    const res = await updateCanteenAnnouncement(
      '', 
      first.dishId || '', 
      first.dishPrice || 0, 
      first.customName || '', 
      first.customPrice || 0,
      updatedList
    );

    if (res.success) {
      updateUser({ 
        announcement: res.announcement,
        specialDishId: res.specialDishId,
        specialDishPrice: res.specialDishPrice,
        customSpecialDishName: res.customSpecialDishName,
        customSpecialDishPrice: res.customSpecialDishPrice,
        specialDishes: res.specialDishes
      });
      setActiveSpecialsList(res.specialDishes || []);
      setPromoSuccessMsg('Dish removed from Today\'s Specials!');
      setTimeout(() => setPromoSuccessMsg(''), 4000);
    } else {
      alert(res.error || 'Failed to remove special dish.');
    }
    setUpdatingAnnouncement(false);
  };

  const handleClearPromotion = async () => {
    setUpdatingAnnouncement(true);
    const res = await updateCanteenAnnouncement('', '', 0, '', 0, []);
    if (res.success) {
      updateUser({ 
        announcement: '',
        specialDishId: '',
        specialDishPrice: 0,
        customSpecialDishName: '',
        customSpecialDishPrice: 0,
        specialDishes: []
      });
      setSelectedDishId('');
      setSpecialPrice('');
      setCustomDishName('');
      setCustomDishPrice('');
      setIsCustomMode(false);
      setActiveSpecialsList([]);
      setPromoSuccessMsg('Promotion ended and daily specials reset! ✨');
      setTimeout(() => setPromoSuccessMsg(''), 4000);
    } else {
      alert(res.error || 'Failed to end promotion.');
    }
    setUpdatingAnnouncement(false);
  };

  const handleEditPromotion = () => {
    const list = user?.specialDishes || [];
    setActiveSpecialsList(list);
    if (list.length > 0) {
      const first = list[0];
      if (first.customName) {
        setIsCustomMode(true);
        setCustomDishName(first.customName);
        setCustomDishPrice(first.customPrice);
        setSelectedDishId('');
        setSpecialPrice('');
      } else {
        setIsCustomMode(false);
        setSelectedDishId(first.dishId);
        setSpecialPrice(first.dishPrice);
        setCustomDishName('');
        setCustomDishPrice('');
      }
    }
    // Smooth scroll back to top of Menu Announcement Board
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleKitchenStatus = async () => {
    if (isSuspended) {
      alert('Your canteen account is Suspended by Admin. You cannot open the kitchen until reactivated by Admin.');
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const nextStatus = isClosed ? 'Open' : 'Closed';
      const res = await api.auth.updateKitchenStatus(nextStatus, token);
      if (res.success) {
        updateUser({ kitchenStatus: res.kitchenStatus });
      } else {
        alert(res.error || 'Failed to update kitchen status.');
      }
    } catch (err) {
      console.error('Failed to toggle kitchen status:', err);
    }
  };

  const canteenOrders = orders.filter((o) => o.canteen === canteenName);
  
  // Group active orders by tab category
  const activeCanteenOrders = canteenOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Rejected');
  const newOrders = activeCanteenOrders.filter((o) => o.status === 'Pending');
  const preparingOrders = activeCanteenOrders.filter((o) => o.status === 'Preparing');
  const readyOrTransitOrders = activeCanteenOrders.filter((o) => ['Ready for Pickup', 'Out for Delivery', 'Payment Pending'].includes(o.status));

  const tabList = 
    ordersTab === 'New' ? newOrders :
    ordersTab === 'Preparing' ? preparingOrders :
    readyOrTransitOrders;

  const tabCounts = {
    New: newOrders.length,
    Preparing: preparingOrders.length,
    Ready: readyOrTransitOrders.length
  };

  const pendingOrders = canteenOrders.filter((o) => o.status === 'Pending' || o.status === 'Preparing');
  const completedOrders = canteenOrders.filter((o) => o.status === 'Delivered');

  // KPI Calculations
  const todaysOrdersCount = canteenOrders.length;
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const pendingCount = pendingOrders.length;

  // Find popular dishes quantities
  const foodQuantities = {};
  completedOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      foodQuantities[item.name] = (foodQuantities[item.name] || 0) + (item.quantity || 1);
    });
  });

  const bestSellers = Object.entries(foodQuantities)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);

  const primarySeller = bestSellers[0]?.name || 'N/A';
  const primarySellerQty = bestSellers[0]?.qty || 0;

  const kpis = [
    { label: "Today's Orders", val: todaysOrdersCount.toString(), change: "All sessions", icon: ClipboardList, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { label: "Revenue (Sales)", val: `₹${totalRevenue.toFixed(2)}`, change: "Delivered items", icon: DollarSign, color: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
    { label: "Pending Queue", val: pendingCount.toString(), change: "Needs attention", icon: Clock, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { label: "Top Seller", val: primarySeller, change: primarySellerQty > 0 ? `${primarySellerQty} items sold` : 'No sales yet', icon: Star, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" }
  ];

  // Compile last 7 days metrics
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const salesByDay = last7Days.map((date) => {
    return completedOrders
      .filter((o) => {
        const orderDate = new Date(o.createdAt || new Date());
        return orderDate.toDateString() === date.toDateString();
      })
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);
  });

  const maxSalesVal = Math.max(...salesByDay, 100);
  const totalWeeklyRevenue = salesByDay.reduce((sum, val) => sum + val, 0);
  const avgDailySales = totalWeeklyRevenue / 7;
  const peakSalesVal = Math.max(...salesByDay);
  const peakDayIdx = salesByDay.indexOf(peakSalesVal);
  const peakDayDate = last7Days[peakDayIdx];
  const peakDayStr = peakSalesVal > 0 && peakDayDate 
    ? peakDayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) 
    : 'No peak yet';
  const avgOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Kitchen Home Page</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Running console for <span className="font-semibold text-emerald-600 dark:text-emerald-400">{canteenName}</span>.
          </p>
        </div>
        <button 
          onClick={toggleKitchenStatus}
          disabled={isSuspended}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm border shrink-0 ${
            isSuspended
              ? 'bg-red-100 dark:bg-red-950/40 text-red-700 border-red-300 dark:border-red-900/60 cursor-not-allowed'
              : isClosed
                ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 cursor-pointer'
                : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 cursor-pointer'
          }`}
        >
          {isSuspended ? 'Store Status: Suspended (By Admin)' : `Store Status: ${kitchenStatus} (Click to toggle)`}
        </button>
      </div>

      {/* 1. Live Orders Queue Panel (PLACED AT TOP FOR IMMEDIATE ATTENTION) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-200">Live Orders Queue</h3>
            <p className="text-xs text-slate-400 mt-1">Accept, reject, and coordinate orders in real-time directly from this console.</p>
          </div>

          {/* Tab Selection Row */}
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl self-start sm:self-auto shadow-inner">
            {[
              { id: 'New', label: 'New Orders', count: tabCounts.New, color: 'text-orange-500 bg-orange-100/10' },
              { id: 'Preparing', label: 'Preparing', count: tabCounts.Preparing, color: 'text-amber-500 bg-amber-100/10' },
              { id: 'Ready', label: 'Ready & Transit', count: tabCounts.Ready, color: 'text-emerald-500 bg-emerald-100/10' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrdersTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  ordersTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                  ordersTab === tab.id ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[260px]">
          {tabList.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="h-14 w-14 bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-850">
                <ChefHat className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Queue is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">No orders are in the "{ordersTab}" category. Student orders will refresh here automatically.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tabList.map((ord) => (
                <div 
                  key={ord.id} 
                  className="bg-slate-50 dark:bg-slate-955/20 border border-slate-150/40 dark:border-slate-850/60 p-5 rounded-3xl flex flex-col justify-between min-h-[270px] shadow-inner relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">#{ord.id}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                        ord.status === 'Pending' ? 'bg-orange-50 dark:bg-orange-955/30 text-orange-605' :
                        ord.status === 'Preparing' ? 'bg-amber-50 dark:bg-amber-955/30 text-amber-600' :
                        'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-650'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="text-xs font-bold text-slate-700 dark:text-slate-350 flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-slate-450 font-black">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cooking Instructions */}
                    {ord.cookingInstructions && (
                      <div className="p-2 bg-amber-500/10 border-l-2 border-amber-500 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400 italic truncate">
                        Request: "{ord.cookingInstructions}"
                      </div>
                    )}

                    {/* Destination details */}
                    <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-850/50 pt-2">
                      <p className="truncate font-semibold"><span className="font-black text-slate-500 uppercase tracking-wide">To:</span> {ord.address}</p>
                      <p className="font-semibold"><span className="font-black text-slate-500 uppercase tracking-wide">Tel:</span> {ord.phone}</p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850/50 flex items-center justify-between mt-auto">
                    <div className="text-left shrink-0">
                      <span className="text-[9px] text-slate-455 uppercase block font-bold">Price Amount</span>
                      <span className="font-black text-sm text-slate-800 dark:text-white">₹{ord.total.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-1.5">
                      {['Preparing', 'Ready for Pickup', 'Accepted', 'Out for Delivery', 'Payment Pending'].includes(ord.status) && (
                        <button
                          type="button"
                          onClick={() => handleOpenChat(ord)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-955/40 dark:hover:bg-indigo-900 text-indigo-650 dark:text-indigo-400 rounded-xl transition-all cursor-pointer shadow-sm relative border-0 flex items-center justify-center shrink-0"
                          title="Open Customer Chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {ord.messages?.length > (readCounts[ord._id || ord.id] || 0) && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                          )}
                        </button>
                      )}

                      {ord.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border-0"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'Rejected')}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border-0"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {ord.status === 'Preparing' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Ready for Pickup')}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border-0"
                        >
                          Ready for Pickup
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-2 min-w-0">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">{kpi.label}</span>
                <span className="text-2xl font-extrabold text-slate-855 dark:text-white block truncate">{kpi.val}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{kpi.change}</span>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Analytics & Management Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Weekly Revenue Breakdown & Top Selling Dishes */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Weekly Revenue Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-955/30 text-orange-500 flex items-center justify-center shrink-0 border border-orange-200/40 dark:border-orange-900/30">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-white text-base">Weekly Revenue Breakdown</h4>
                  <p className="text-xs text-slate-400 font-medium">Daily income performance for the last 7 sessions</p>
                </div>
              </div>

              {/* Total 7-Day Badge */}
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 dark:border-orange-900/30 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">7-Day Total</span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400">₹{totalWeeklyRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Bar Chart Representation */}
            <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
              <div className="h-44 flex items-end gap-3 sm:gap-4 pt-6 pb-1">
                {last7Days.map((date, idx) => {
                  const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                  const daySales = salesByDay[idx];
                  const pct = Math.min((daySales / maxSalesVal) * 100, 100);
                  const isPeak = daySales > 0 && daySales === peakSalesVal;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Day value label above bar */}
                      <span className={`text-[10px] font-black transition-all ${
                        isPeak ? 'text-orange-500 scale-105' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        ₹{daySales.toFixed(0)}
                      </span>

                      {/* Bar container */}
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-xl h-full flex items-end overflow-hidden p-0.5">
                        <div 
                          style={{ height: `${Math.max(pct, 6)}%` }} 
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isPeak 
                              ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-md shadow-orange-500/20' 
                              : daySales > 0 
                                ? 'bg-gradient-to-t from-orange-400/80 to-amber-400/80 group-hover:from-orange-500 group-hover:to-amber-500' 
                                : 'bg-slate-300/40 dark:bg-slate-700/40'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 truncate max-w-[45px] font-bold mt-1">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rectangular Summary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Daily Sales</span>
                <span className="text-base font-extrabold text-slate-855 dark:text-white block">₹{avgDailySales.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block">Based on 7-day average</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Sales Day</span>
                <span className="text-base font-extrabold text-orange-500 block truncate">{peakDayStr}</span>
                <span className="text-[9px] text-slate-400 block">Highest day: ₹{peakSalesVal.toFixed(2)}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
                <span className="text-base font-extrabold text-slate-855 dark:text-white block">₹{avgOrderValue.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block">Per completed ticket</span>
              </div>
            </div>
          </div>

          {/* Top Selling Dishes / Popular Items Card (PLACED DIRECTLY UNDER WEEKLY REVENUE BREAKDOWN) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-955/30 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/30 dark:border-amber-900/30">
                  <Star className="h-5 w-5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-white text-base">Top Selling Dishes</h4>
                  <p className="text-xs text-slate-400 font-medium">Most popular menu items by sales volume</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                Real-Time Rankings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {bestSellers.length === 0 ? (
                <div className="col-span-full text-center py-6">
                  <p className="text-slate-400 text-xs font-medium">No dish sales recorded yet.</p>
                </div>
              ) : (
                bestSellers.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0 
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                          : idx === 1 
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                            : 'bg-amber-100 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{item.name}</span>
                        <span className="text-[9.5px] text-slate-400 block font-medium">Popular Dish</span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-orange-500 bg-orange-50 dark:bg-orange-955/30 border border-orange-200/40 dark:border-orange-900/30 px-2.5 py-1 rounded-xl shrink-0">
                      {item.qty} sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dish Ratings Summary Card (PLACED DIRECTLY UNDER TOP SELLING DISHES) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-955/30 text-orange-500 flex items-center justify-center shrink-0 border border-orange-200/30 dark:border-orange-900/30">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-white text-base">Dish Ratings Summary</h4>
                  <p className="text-xs text-slate-400 font-medium">Customer reviews and feedback aggregated per dish</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                Student Reviews
              </span>
            </div>

            {ratingsSummary.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-xs font-medium">No dish reviews or ratings received yet.</p>
                <p className="text-[9.5px] text-slate-450 mt-1">When students complete their orders, their ratings will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {ratingsSummary.map((dish) => (
                  <div key={dish.foodName} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                    {/* Dish name + avg badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight truncate">{dish.foodName}</span>
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-955/20 border border-amber-200/40 dark:border-amber-900/30 px-2 py-0.5 rounded-lg shrink-0">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-black text-amber-600">{parseFloat(dish.avgRating).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Star bar + count */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.floor(dish.avgRating)
                                ? 'text-amber-400 fill-amber-400'
                                : star - 0.5 <= dish.avgRating
                                  ? 'text-amber-400 fill-amber-200'
                                  : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                        {dish.count} {dish.count === 1 ? 'rating' : 'ratings'}
                      </span>
                    </div>

                    {/* Latest comment if any */}
                    {dish.latestComment && (
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-450 italic bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850/50 px-2.5 py-1.5 rounded-xl leading-relaxed line-clamp-2">
                        "{dish.latestComment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full lg:max-w-md">
          {/* Announcement / Specials editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500 animate-bounce" />
              <h4 className="font-bold text-slate-855 dark:text-white text-base">Menu Announcement Board</h4>
            </div>

            {promoSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs font-bold animate-pulse">
                {promoSuccessMsg}
              </div>
            )}

            <div className="space-y-3">

              <div className="flex gap-2 bg-slate-105 dark:bg-slate-950 p-1 rounded-xl w-full mb-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    !isCustomMode 
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-655'
                  }`}
                >
                  Choose From Menu
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    isCustomMode 
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-655'
                  }`}
                >
                  Custom Special
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Promoted Dish</label>
                    <select
                      value={selectedDishId}
                      onChange={(e) => setSelectedDishId(e.target.value)}
                      className="auth-input text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-850 cursor-pointer"
                    >
                      <option value="">-- Select Dish --</option>
                      {canteenFoods.map((f) => (
                        <option key={f._id || f.id} value={f._id || f.id}>{f.name} (₹{f.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Promo Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={specialPrice}
                      onChange={(e) => setSpecialPrice(e.target.value)}
                      className="auth-input text-xs py-2 px-3 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Custom Dish Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cheese Pizza Burger"
                      value={customDishName}
                      onChange={(e) => setCustomDishName(e.target.value)}
                      className="auth-input text-xs py-2 px-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Custom Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={customDishPrice}
                      onChange={(e) => setCustomDishPrice(e.target.value)}
                      className="auth-input text-xs py-2 px-3 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddDirectSpecial}
                disabled={updatingAnnouncement}
                className="btn-primary w-full py-2.5 text-xs flex justify-center items-center gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <span>{updatingAnnouncement ? 'Adding...' : "➕ Add to Today's Specials"}</span>
              </button>
            </div>
          </div>

          {/* Active Today's Special Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h4 className="font-bold text-slate-855 dark:text-white text-base">Active Today's Specials</h4>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-955 text-orange-605">LIVE STATUS</span>
            </div>

            {user?.specialDishes && user.specialDishes.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {user.specialDishes.map((item, idx) => {
                    const dishName = item.customName || canteenFoods.find(f => (f._id || f.id) === item.dishId)?.name || 'Loading dish...';
                    const dishPrice = item.customName ? item.customPrice : item.dishPrice;
                    const isCustom = !!item.customName;
                    return (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 border border-emerald-250/20 shrink-0">
                            {isCustom ? 'Custom Special' : 'Menu Special'}
                          </span>
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block truncate mt-1">
                            {dishName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promo Price</span>
                            <span className="text-sm font-black text-orange-500 mt-0.5 block">
                              ₹{dishPrice}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDirectSpecial(idx)}
                            disabled={updatingAnnouncement}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/25 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                            title="Remove Special"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearPromotion}
                    disabled={updatingAnnouncement}
                    className="w-full py-2.5 bg-red-50 dark:bg-red-955/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-655 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200/50 dark:border-red-900/35 transition-all cursor-pointer"
                  >
                    Clear All Specials
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block font-medium">No Today's Specials active currently.</span>
                <span className="text-[9px] text-slate-400/80 block mt-1">Use the announcement card above to set one!</span>
              </div>
            )}
          </div>

          {/* Canteen Discount Vouchers Management */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-slate-855 dark:text-white text-base">Discount Vouchers</h4>
            </div>

            {/* List of active canteen-specific and global vouchers */}
            {(() => {
              const myVouchers = vouchers.filter(v => (!v.canteen || v.canteen.toLowerCase() === canteenName.toLowerCase()) && (!v.excludedCanteens || !v.excludedCanteens.includes(canteenName)));
              return (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">My Promo Codes ({myVouchers.length})</span>
                  {myVouchers.length === 0 ? (
                    <p className="text-[10px] text-slate-450 italic font-semibold">No active coupons created yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {myVouchers.map((coupon) => (
                        <div key={coupon._id || coupon.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-955 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-slate-800 dark:text-slate-100">{coupon.code}</span>
                              <span className="text-[9px] bg-indigo-55 dark:bg-indigo-950 text-indigo-550 px-1.5 py-0.5 rounded font-black">{coupon.discount}% OFF</span>
                              {!coupon.canteen ? (
                                <span className="text-[8px] bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 px-1.5 py-0.5 rounded font-black uppercase">Global</span>
                              ) : (
                                <span className="text-[8px] bg-amber-50 dark:bg-amber-955/30 text-amber-600 px-1.5 py-0.5 rounded font-bold">{coupon.category || 'All Items'}</span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-slate-450 block truncate mt-0.5">{coupon.description || 'No description'}</span>
                            <span className="text-[8.5px] text-slate-400 block">Min. Cart: ₹{coupon.minCartValue || 0} • Target: {coupon.category || 'All Items'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!coupon.canteen) {
                                alert('This is a global voucher. Please ask an administrator to delete it.');
                                return;
                              }
                              if (!window.confirm('Delete this voucher?')) return;
                              const res = await deleteVoucher(coupon._id || coupon.id);
                              if (res.success) {
                                alert('Voucher deleted successfully!');
                              } else {
                                alert(res.error || 'Failed to delete voucher.');
                              }
                            }}
                            className="text-red-500 hover:text-red-655 p-1 font-bold cursor-pointer"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Create voucher form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const code = e.target.voucherCode.value.trim().toUpperCase();
              const discount = parseFloat(e.target.voucherDiscount.value);
              const minVal = parseFloat(e.target.voucherMinVal.value) || 0;
              const category = e.target.voucherCategory.value;
              const desc = e.target.voucherDesc.value.trim();

              if (!code || isNaN(discount) || discount <= 0) {
                alert('Please enter a valid code and discount percentage.');
                return;
              }

              const res = await createVoucher({ code, discount, minCartValue: minVal, category, description: desc });
              if (res.success) {
                e.target.reset();
                alert(`Voucher coupon "${code}" created successfully for ${category === 'All' ? 'All Items' : category + ' dishes'}!`);
              } else {
                alert(res.error || 'Failed to create voucher.');
              }
            }} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Create Canteen Coupon</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-455 block">PROMO CODE</label>
                  <input
                    type="text"
                    name="voucherCode"
                    placeholder="e.g. PIZZA30"
                    className="auth-input text-xs py-1.5 px-3 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-455 block">DISCOUNT (%)</label>
                  <input
                    type="number"
                    name="voucherDiscount"
                    placeholder="e.g. 30"
                    className="auth-input text-xs py-1.5 px-3 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">FOOD CATEGORY TARGET</label>
                <select
                  name="voucherCategory"
                  className="auth-input text-xs py-1.5 px-3 rounded-xl cursor-pointer"
                >
                  <option value="All">All Categories (All Items)</option>
                  <option value="Pizza">Pizzas 🍕</option>
                  <option value="Burgers">Burgers 🍔</option>
                  <option value="Biryani">Biryani 🍲</option>
                  <option value="Snacks">Snacks 🥪</option>
                  <option value="Rolls">Rolls 🌯</option>
                  <option value="Noodles">Noodles 🍜</option>
                  <option value="Beverages">Beverages 🥤</option>
                  <option value="Desserts">Desserts 🍦</option>
                  <option value="South Indian">South Indian 🍛</option>
                  <option value="North Indian">North Indian 🥘</option>
                  <option value="Chinese">Chinese 🥢</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">MINIMUM CART AMOUNT (₹)</label>
                <input
                  type="number"
                  name="voucherMinVal"
                  placeholder="e.g. 150 (0 for none)"
                  className="auth-input text-xs py-1.5 px-3 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">COUPON TERMS / INFO</label>
                <input
                  type="text"
                  name="voucherDesc"
                  placeholder="e.g. Get 30% off on all pizzas!"
                  className="auth-input text-xs py-1.5 px-3 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm border-0"
              >
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      </div>

      
      <OrderChat 
        order={selectedChatOrder} 
        role="canteen" 
        isOpen={!!selectedChatOrder} 
        onClose={() => setSelectedChatOrder(null)} 
      />
    </div>
  );
};

export default CanteenDashboard;

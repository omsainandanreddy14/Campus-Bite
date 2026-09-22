import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import OrderChat from '../../components/OrderChat';
import { Truck, MapPin, CheckCircle, Navigation, Phone, ShieldAlert, MessageSquare, Star, Award, Compass, Volume2, BarChart3, TrendingUp, DollarSign, Gift } from 'lucide-react';

const DeliveryDashboard = () => {
  const { orders, updateOrderStatus, playPickupDispatchChime } = useApp();
  const { user } = useAuth();
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);

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

  const [dutyStatus, setDutyStatus] = useState(() => sessionStorage.getItem('delivery_duty_status') || 'Online');

  useEffect(() => {
    const handleDutyChange = () => {
      const current = sessionStorage.getItem('delivery_duty_status') || 'Online';
      setDutyStatus(current);
    };
    window.addEventListener('duty_status_changed', handleDutyChange);
    return () => window.removeEventListener('duty_status_changed', handleDutyChange);
  }, []);

  const toggleDutyStatus = () => {
    const next = dutyStatus === 'Online' ? 'Offline' : 'Online';
    setDutyStatus(next);
    sessionStorage.setItem('delivery_duty_status', next);
    window.dispatchEvent(new Event('duty_status_changed'));
  };

  // Custom Today's Goal Target State
  const [targetGoal, setTargetGoal] = useState(() => {
    const saved = sessionStorage.getItem('delivery_target_goal');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(targetGoal.toString());

  const handleSaveGoal = (e) => {
    if (e) e.preventDefault();
    const val = parseInt(tempGoalInput, 10);
    if (!val || val <= 0) {
      alert('Please enter a valid drop goal target (e.g. 5, 8, 10).');
      return;
    }
    setTargetGoal(val);
    sessionStorage.setItem('delivery_target_goal', val.toString());
    setIsEditingGoal(false);
  };

  const activeDeliveries = orders.filter((o) => ['Accepted', 'Out for Delivery', 'Payment Pending'].includes(o.status) && o.deliveryBoy?.toLowerCase() === user?.name?.toLowerCase());
  const completedDeliveries = orders.filter((o) => o.status === 'Delivered' && o.deliveryBoy?.toLowerCase() === user?.name?.toLowerCase());
  const pickupQueue = orders.filter((o) => o.status === 'Ready for Pickup');

  const completedCount = completedDeliveries.length;
  const earningsToday = completedCount * 20.00; // Payout calculation (₹20 per delivery)
  const estimatedKm = (completedCount * 1.8).toFixed(1); // Avg 1.8km per campus drop
  const goalProgressPct = Math.min(Math.round((completedCount / targetGoal) * 100), 100);

  // Dynamic Service Rating calculation from orders rated for this delivery partner
  const myRatedOrders = orders.filter(o => o.deliveryBoy?.toLowerCase() === user?.name?.toLowerCase() && o.riderRating > 0);
  const myAvgRating = myRatedOrders.length > 0
    ? (myRatedOrders.reduce((sum, o) => sum + o.riderRating, 0) / myRatedOrders.length)
    : (user?.riderRating || 5.0);
  const myRatingCount = myRatedOrders.length > 0 ? myRatedOrders.length : (user?.riderRatingCount || 0);

  // Rider leaderboard calculation from global orders list
  const riderStats = {};
  orders.forEach(o => {
    if (o.deliveryBoy) {
      const name = o.deliveryBoy;
      if (!riderStats[name]) {
        riderStats[name] = { name, completedCount: 0, totalRating: 0, ratingCount: 0 };
      }
      if (o.status === 'Delivered') {
        riderStats[name].completedCount++;
      }
      if (o.riderRating && o.riderRating > 0) {
        riderStats[name].totalRating += o.riderRating;
        riderStats[name].ratingCount++;
      }
    }
  });

  // Ensure currently logged in user is represented in stats
  if (user?.name && !riderStats[user.name]) {
    riderStats[user.name] = { name: user.name, completedCount: completedCount, totalRating: 0, ratingCount: 0 };
  }

  const leaderboard = Object.values(riderStats)
    .map(rider => {
      const isMe = rider.name.toLowerCase() === user?.name?.toLowerCase();
      const avgRating = isMe 
        ? myAvgRating 
        : (rider.ratingCount > 0 ? (rider.totalRating / rider.ratingCount) : 5.0);
      return {
        ...rider,
        avgRating,
        ratingCount: isMe ? myRatingCount : rider.ratingCount
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount || b.avgRating - a.avgRating);

  // Find current rider standing
  const currentRiderIndex = leaderboard.findIndex(r => r.name.toLowerCase() === user?.name?.toLowerCase());
  const standingRank = currentRiderIndex !== -1 ? currentRiderIndex + 1 : null;

  // Compile badges for currently logged-in rider
  const riderBadges = [];
  if (standingRank === 1) {
    riderBadges.push({ label: '🏆 Gold Champion', desc: 'Ranked #1 on campus deliveries leaderboard!', color: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 border-amber-250/20' });
  } else if (standingRank === 2) {
    riderBadges.push({ label: '🥈 Silver Standing', desc: 'Ranked #2 on campus deliveries leaderboard!', color: 'bg-slate-105 text-slate-700 border-slate-200/20 dark:bg-slate-800/40' });
  } else if (standingRank === 3) {
    riderBadges.push({ label: '🥉 Bronze Standing', desc: 'Ranked #3 on campus deliveries leaderboard!', color: 'bg-orange-50 dark:bg-orange-955/20 text-orange-605 border-orange-255/10' });
  }

  if (myAvgRating >= 4.8 && myRatingCount > 0) {
    riderBadges.push({ label: '⭐ Elite Service', desc: 'Maintained a rating above 4.8 stars!', color: 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-250/20' });
  }

  if (completedCount >= targetGoal) {
    riderBadges.push({ label: `⚡ Goal Achieved (${targetGoal} Drops)`, desc: `Successfully hit your today's custom goal of ${targetGoal} drops!`, color: 'bg-indigo-50 dark:bg-indigo-955/20 text-indigo-650 border-indigo-250/20' });
  }

  const handleAcceptPickup = async (orderId) => {
    if (dutyStatus !== 'Online') {
      alert('You are currently Duty Offline. Please switch to Duty Online to accept orders.');
      return;
    }
    if (activeDeliveries.length >= 2) {
      alert('You can only accept a maximum of 2 active orders at a time.');
      return;
    }
    const res = await updateOrderStatus(orderId, 'Accepted');
    if (!res.success) {
      alert(res.error || 'Failed to accept order.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Delivery Home Page</h2>
          <p className="text-slate-550 dark:text-slate-400 mt-1">Accept active delivery assignments, track earnings, and navigate campus routes.</p>
        </div>

        {/* Home Page Duty Toggle Button */}
        <button
          onClick={toggleDutyStatus}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border shrink-0 ${
            dutyStatus === 'Online'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20 hover:bg-emerald-600'
              : 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 hover:bg-amber-600'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <span>Status: {dutyStatus === 'Online' ? 'Duty Online (Active)' : 'Duty Offline (Paused)'}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Active Deliveries</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white">
              {activeDeliveries.length} Active
            </span>
          </div>
          <div className="h-10 w-10 bg-indigo-150 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-405 rounded-xl flex items-center justify-center">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Completed Payouts</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-white">
              ₹{earningsToday.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">{completedCount} drops ({estimatedKm} km)</span>
          </div>
          <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Service Rating</span>
            {myRatingCount > 0 ? (
              <span className="text-2xl font-extrabold text-slate-855 dark:text-white">
                ⭐️ {myAvgRating.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400 ml-1">({myRatingCount} {myRatingCount === 1 ? 'rating' : 'ratings'})</span>
              </span>
            ) : (
              <span className="text-2xl font-extrabold text-slate-855 dark:text-white">
                ⭐️ 5.0 <span className="text-xs text-slate-400 ml-1">(Default)</span>
              </span>
            )}
          </div>
          <div className="h-10 w-10 bg-amber-100 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          </div>
        </div>

        {/* Dynamic Custom Daily Goal & Milestone Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Today's Goal Target</span>
            <button 
              type="button"
              onClick={() => {
                setTempGoalInput(targetGoal.toString());
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-955 text-indigo-600 border border-indigo-200/40 hover:bg-indigo-100 transition-all cursor-pointer"
            >
              {isEditingGoal ? 'Cancel' : '⚙️ Set Goal'}
            </button>
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="space-y-2">
              <div className="flex gap-1.5">
                {[5, 8, 10, 12].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTargetGoal(preset);
                      sessionStorage.setItem('delivery_target_goal', preset.toString());
                      setIsEditingGoal(false);
                    }}
                    className={`flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border ${
                      targetGoal === preset 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Custom target"
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  className="auth-input text-xs py-1 px-2 rounded-xl flex-1"
                />
                <button type="submit" className="btn-primary py-1 px-3 text-xs bg-indigo-600 font-bold cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                <span>{completedCount}/{targetGoal} Drops Target</span>
                <span className="text-orange-500 font-extrabold">{goalProgressPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${goalProgressPct}%` }} />
              </div>
              <span className="text-[9.5px] text-slate-400 font-semibold block mt-1">
                {completedCount >= targetGoal ? '🎉 Target Accomplished!' : `Complete ${targetGoal - completedCount} more drops today`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout: Assigned Orders, Active Routes & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Assigned Orders & Active Routes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Assigned Orders Ready for Pickup Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-855 dark:text-slate-200 flex items-center gap-2">
                <span>Assigned Pickups</span>
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-955 text-orange-600 text-xs font-extrabold rounded-full">{pickupQueue.length}</span>
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playPickupDispatchChime && playPickupDispatchChime()}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-955/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Test Audio Dispatch Chime"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Test Chime</span>
                </button>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Ready at canteen kitchens</span>
              </div>
            </div>

            {dutyStatus === 'Offline' ? (
              <div className="bg-amber-50 dark:bg-amber-955/25 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 text-center space-y-3 shadow-sm">
                <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base">You are currently Duty Offline (On Break)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    New canteen pickup assignments are paused while offline. Switch your status to <strong>Duty Online</strong> to start receiving real-time orders!
                  </p>
                </div>
                <button
                  onClick={toggleDutyStatus}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span>Switch to Duty Online 🟢</span>
                </button>
              </div>
            ) : pickupQueue.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 text-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-slate-350 mx-auto" />
                <p className="text-slate-450 text-xs font-semibold">No packages ready for pickup currently. Canteens will prepare items shortly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pickupQueue.map((ord) => (
                  <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <span className="font-extrabold text-slate-855 dark:text-white text-base">{ord.id}</span>
                        <span className="text-xs font-bold text-orange-500 block">{ord.canteen}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold rounded-lg border border-amber-200/50 uppercase tracking-wider">
                        Ready for Pickup
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Drop Location</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ord.customer} • {ord.address}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-xl space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Items</span>
                        {ord.items.map((it, idx) => (
                          <span key={idx} className="text-slate-700 dark:text-slate-300 font-semibold block">{it.quantity}x {it.name}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptPickup(ord.id)}
                      className="btn-primary w-full py-2.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/10 font-bold cursor-pointer"
                    >
                      <span>Accept & Start Delivery</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Delivery Routes */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-200">Active Delivery Routes ({activeDeliveries.length}/2)</h3>
            {activeDeliveries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
                <ShieldAlert className="h-10 w-10 text-slate-350 mx-auto" />
                <p className="text-slate-450 text-sm">You have no active route. Accept a package from the Assigned Pickups queue above to start your route!</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeliveries.map((gig) => (
                <div key={gig.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm h-fit">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white text-lg">{gig.id}</span>
                      <span className="text-xs text-slate-400 block">{gig.canteen}</span>
                    </div>
                    <span className="px-3 py-1 bg-indigo-55 dark:bg-indigo-955/20 text-indigo-650 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 uppercase tracking-wider">
                      {gig.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-455 uppercase block font-semibold">Drop Destination</span>
                        <span className="text-sm font-bold text-slate-855 dark:text-slate-200">{gig.customer} • {gig.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-455 uppercase block font-semibold">Recipient Mobile</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gig.phone}</span>
                      </div>
                    </div>

                    {gig.cookingInstructions && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-1">
                        <span className="font-bold text-amber-800 dark:text-amber-400 uppercase block tracking-wider text-[9px]">Chef/Preparation Note</span>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold italic">"{gig.cookingInstructions}"</p>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-slate-450 uppercase block mb-1">Package Contents</span>
                      {gig.items.map((ci) => (
                        <div key={ci.id} className="flex justify-between font-semibold text-slate-655 dark:text-slate-350">
                          <span>{ci.quantity}x {ci.name}</span>
                          <span>Paid</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button className="flex-1 btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer">
                      <Navigation className="h-4.5 w-4.5 text-indigo-500" />
                      <span>Open Map</span>
                    </button>
                    <button 
                      onClick={() => handleOpenChat(gig)}
                      className="flex-1 btn-secondary text-xs py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer relative"
                    >
                      <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                      <span>Chat</span>
                      {gig.messages?.length > (readCounts[gig._id || gig.id] || 0) && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-555 rounded-full animate-ping" />
                      )}
                    </button>
                     {gig.status === 'Accepted' && (
                       <button 
                         onClick={() => updateOrderStatus(gig.id, 'Out for Delivery')}
                         className="flex-1 btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs py-2.5 shadow-orange-500/10 cursor-pointer font-bold"
                       >
                         <span>Picked Up Package</span>
                       </button>
                     )}
                     {gig.status === 'Out for Delivery' && (
                        <button 
                          onClick={() => setPaymentModalOrder(gig)}
                          className="flex-1 btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs py-2.5 shadow-orange-500/10 cursor-pointer font-extrabold flex items-center justify-center gap-1.5"
                        >
                          <span>Request Payment from Student Wallet (₹{gig.total?.toFixed(2)}) 📱</span>
                        </button>
                      )}
                      {gig.status === 'Payment Pending' && (
                        <div className="flex-1 p-2 bg-amber-50 dark:bg-amber-955/30 border border-amber-300/60 dark:border-amber-900/40 rounded-xl text-[11px] font-extrabold text-amber-600 dark:text-amber-400 text-center animate-pulse">
                          <span>📱 Payment Request Sent — Waiting for Student Wallet Approval</span>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* 📊 Weekly Earnings & Daily Payout Breakdown Tab */}
          {(() => {
            const last7DaysRider = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return d;
            });

            const weeklyRiderSales = last7DaysRider.map((date, idx) => {
              const dateString = date.toDateString();
              const todayString = new Date().toDateString();

              const dayOrders = completedDeliveries.filter((o) => {
                if (o.createdAt) {
                  return new Date(o.createdAt).toDateString() === dateString;
                }
                return dateString === todayString;
              });

              const count = dayOrders.length;
              const basePay = count * 20.00;
              const tips = dayOrders.reduce((sum, o) => sum + (o.courierTip || 0), 0);
              const total = basePay + tips;

              return {
                date,
                dateLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dropCount: count,
                basePay,
                tips,
                total
              };
            });

            const totalWeeklyBase = weeklyRiderSales.reduce((sum, d) => sum + d.basePay, 0);
            const totalWeeklyTips = weeklyRiderSales.reduce((sum, d) => sum + d.tips, 0);
            const totalWeeklyEarnings = totalWeeklyBase + totalWeeklyTips;
            const maxWeeklyDayTotal = Math.max(...weeklyRiderSales.map(d => d.total), 100);

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/40 dark:border-emerald-900/30">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-855 dark:text-white text-base">Weekly Earnings & Payout Breakdown</h4>
                      <p className="text-xs text-slate-400 font-medium">Daily income comparison (Mon–Sun): Base Pay (₹20/drop) vs Student Tips</p>
                    </div>
                  </div>

                  {/* Total 7-Day Income Badge */}
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-900/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 self-start sm:self-auto">
                    <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">7-Day Income</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{totalWeeklyEarnings.toFixed(2)}</span>
                  </div>
                </div>

                {/* Interactive Bar Chart */}
                <div className="bg-slate-50/80 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                  <div className="h-48 flex items-end gap-3 sm:gap-5 pt-8 pb-1">
                    {weeklyRiderSales.map((day, idx) => {
                      const pct = Math.min((day.total / maxWeeklyDayTotal) * 100, 100);
                      const isToday = idx === 6;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          {/* Hover Tooltip Card */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9.5px] p-2 rounded-xl pointer-events-none z-20 shadow-xl border border-slate-700 whitespace-nowrap text-center space-y-0.5">
                            <p className="font-black text-amber-400">{day.dateLabel} ({day.dropCount} Drops)</p>
                            <p className="text-slate-300">Base Pay: ₹{day.basePay} • Student Tips: ₹{day.tips}</p>
                          </div>

                          {/* Day value label above bar */}
                          <span className={`text-[10.5px] font-black transition-all ${
                            isToday ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            ₹{day.total.toFixed(0)}
                          </span>

                          {/* Bar container */}
                          <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-xl h-full flex items-end overflow-hidden p-0.5">
                            <div 
                              style={{ height: `${Math.max(pct, 8)}%` }} 
                              className={`w-full rounded-lg transition-all duration-500 flex flex-col justify-end overflow-hidden ${
                                isToday 
                                  ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20' 
                                  : 'bg-gradient-to-t from-indigo-500/80 to-blue-400/80 group-hover:from-indigo-600 group-hover:to-blue-500'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-455 dark:text-slate-400 truncate max-w-[45px] font-bold mt-1">
                            {day.dateLabel} {isToday && '(Today)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Income Stream Breakdown Pills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Payouts (₹20/drop)</span>
                      <span className="text-base font-black text-slate-855 dark:text-white">₹{totalWeeklyBase.toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-955/30 text-indigo-500 flex items-center justify-center shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Tips (100% Delivery Partner)</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{totalWeeklyTips.toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-955/30 text-emerald-500 flex items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right side: Standings and Badges */}
        <div className="space-y-6">
          {/* Achievement Badges Console */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              <h4 className="font-bold text-slate-855 dark:text-white text-base">My Achievements</h4>
            </div>
            
            {riderBadges.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-semibold">No achievements unlocked yet. Complete drops to earn premium badges!</p>
            ) : (
              <div className="space-y-3">
                {riderBadges.map((badge, idx) => (
                  <div key={idx} className={`p-3.5 border rounded-2xl flex items-start gap-3 transition-all ${badge.color}`}>
                    <span className="text-sm">⭐</span>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-xs block">{badge.label}</span>
                      <span className="text-[10px] opacity-80 block leading-normal">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rider Standings Leaderboard */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-slate-855 dark:text-white text-base">Delivery Leaderboard</h4>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-450 italic text-center py-4">No active standings recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((rider, idx) => {
                  const isMe = rider.name.toLowerCase() === user?.name?.toLowerCase();
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isMe 
                          ? 'bg-orange-50/40 border-orange-200/80 dark:bg-orange-955/10 dark:border-orange-900/40 ring-1 ring-orange-500/20 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-955/20 border-slate-100 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-6 w-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-955/35' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-605 dark:bg-orange-955/35' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-900'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${isMe ? 'text-orange-500 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                            {rider.name} {isMe && '(You)'}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">★ {rider.avgRating.toFixed(1)} Rating</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-150/40 dark:border-slate-800 shrink-0">
                        {rider.completedCount} drops
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Panel */}
      {selectedChatOrder && (
        <OrderChat 
          order={orders.find((o) => o.id === selectedChatOrder.id)}
          role="delivery"
          isOpen={!!selectedChatOrder}
          onClose={() => setSelectedChatOrder(null)}
        />
      )}

      {/* Payment & Drop Confirmation Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
                  ₹
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-855 dark:text-white text-base">Payment & Drop Confirmation</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Order #{paymentModalOrder.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentModalOrder(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 border-0 bg-transparent text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Student Recipient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{paymentModalOrder.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Hostel Destination:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{paymentModalOrder.address}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 font-bold">Food Subtotal:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">₹{paymentModalOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Delivery & Platform Fee:</span>
                <span className="font-extrabold text-emerald-600">₹40.00</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800 text-sm">
                <span className="font-extrabold text-slate-855 dark:text-white">Total Amount to Collect:</span>
                <span className="font-black text-orange-500 text-base">₹{paymentModalOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={async () => {
                  const res = await updateOrderStatus(paymentModalOrder.id, 'Payment Pending');
                  if (res.success) {
                    setPaymentModalOrder(null);
                  } else {
                    alert(res.error || 'Failed to request student wallet payment.');
                  }
                }}
                className="btn-primary w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Payment from Student Wallet 📱</span>
              </button>
              <p className="text-[10.5px] text-slate-400 text-center font-medium">
                Order automatically completes & marks <strong>Delivered</strong> immediately after the student approves payment from their wallet!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;

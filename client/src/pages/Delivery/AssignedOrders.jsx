import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bike, MapPin, Store, Clipboard } from 'lucide-react';

const AssignedOrders = () => {
  const { orders, updateOrderStatus } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dutyStatus, setDutyStatus] = useState(() => sessionStorage.getItem('delivery_duty_status') || 'Online');

  React.useEffect(() => {
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

  const pickupQueue = orders.filter((o) => o.status === 'Ready for Pickup');

  const handleAcceptPickup = async (orderId) => {
    if (dutyStatus !== 'Online') {
      alert('You are currently Duty Offline. Please switch to Duty Online to accept orders.');
      return;
    }
    const activeCount = orders.filter((o) => 
      ['Accepted', 'Out for Delivery', 'Payment Pending'].includes(o.status) && 
      o.deliveryBoy?.toLowerCase() === user?.name?.toLowerCase()
    ).length;

    if (activeCount >= 2) {
      alert('You can only accept a maximum of 2 active orders at a time.');
      return;
    }

    const res = await updateOrderStatus(orderId, 'Accepted');
    if (res.success) {
      navigate('/delivery/dashboard');
    } else {
      alert(res.error || 'Failed to accept order. It might have been taken by another rider.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Assigned Deliveries</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Accept packages at the canteen kitchens and drop them at hostels.</p>
        </div>
        <button
          onClick={toggleDutyStatus}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            dutyStatus === 'Online' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-955/30 dark:border-emerald-900/40 dark:text-emerald-400' 
              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-955/30 dark:border-amber-900/40 dark:text-amber-400'
          }`}
        >
          {dutyStatus === 'Online' ? 'Duty Online 🟢' : 'Duty Offline 🌙'}
        </button>
      </div>

      {dutyStatus === 'Offline' ? (
        <div className="bg-amber-50 dark:bg-amber-955/25 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            🌙
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">You are currently Duty Offline</h3>
            <p className="text-slate-450 dark:text-slate-500 text-sm mt-1">Assignments are paused while on break. Switch your status to Duty Online to receive live canteen pickup packages.</p>
          </div>
          <button
            onClick={toggleDutyStatus}
            className="btn-primary py-2 px-5 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Switch to Duty Online 🟢</span>
          </button>
        </div>
      ) : pickupQueue.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-slate-150 dark:bg-slate-800/40 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Clipboard className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No pending pickups</h3>
            <p className="text-slate-450 dark:text-slate-500 text-sm mt-1">Canteens will mark packages ready for pickup once cooking is completed.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {pickupQueue.map((ord) => (
            <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <div>
                  <span className="font-extrabold text-slate-850 dark:text-white text-base">{ord.id}</span>
                  <span className="text-xs text-slate-400 block">Ordered at {ord.time}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-lg">
                  Pickup Ready
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <Store className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase block font-semibold">Canteen Pickup</span>
                    <span className="font-bold text-slate-750 dark:text-slate-350">{ord.canteen}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-455 uppercase block font-semibold">Hostel Drop</span>
                    <span className="font-bold text-slate-750 dark:text-slate-355">{ord.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850">
                <span className="text-xs text-slate-400">Total Items: <span className="font-bold text-slate-700 dark:text-slate-300">{ord.items.reduce((acc, i) => acc + i.quantity, 0)} items</span></span>
                <button 
                  onClick={() => handleAcceptPickup(ord.id)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
                >
                  <Bike className="h-4 w-4" />
                  <span>Accept Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;

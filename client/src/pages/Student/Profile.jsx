import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import WalletModal from '../../components/WalletModal';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Home, 
  CheckCircle2, 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardList, 
  Wallet, 
  LogOut, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateProfileAddress } = useAuth();
  const { cart, orders, vouchers } = useApp();
  const navigate = useNavigate();

  const [hostel, setHostel] = useState(user?.hostel || '');
  const [room, setRoom] = useState(user?.room || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [walletOpen, setWalletOpen] = useState(false);

  const cartItemsCount = (cart || []).reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = (orders || []).filter(
    (o) => o.customer === user?.name && ['Ordered', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
  ).length;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess('');
    setError('');

    const res = await updateProfileAddress(hostel, room, phone);
    if (res.success) {
      setSuccess('Default delivery address & phone updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update delivery address.');
    }
    setUpdating(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner Card */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-3xl shadow-inner border-2 border-white/30">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
                <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  {user?.role || 'Student'}
                </span>
              </div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email}</span>
              </p>
              <p className="text-orange-100 text-[11px] font-semibold flex items-center gap-2 pt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{user?.hostel && user?.room ? `${user.hostel}, Room ${user.room}` : 'No address set'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setWalletOpen(true)}
              className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-0"
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet: ₹{user?.wallet !== undefined ? user.wallet.toFixed(2) : '0.00'}</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards (Left Sidebar Columns Options) */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">
          Quick Access (Left Sidebar Columns)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/student/dashboard"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-955/30 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Dashboard</span>
                <span className="text-[10px] text-slate-400 font-medium">Browse Canteens</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/student/cart"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer relative"
          >
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-955/30 text-amber-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </div>
            {cartItemsCount > 0 && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white font-black text-xs h-6 px-2 rounded-full flex items-center justify-center shadow">
                {cartItemsCount}
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">My Cart</span>
                <span className="text-[10px] text-slate-400 font-medium">View Checkout</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/student/orders"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer relative"
          >
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-955/30 text-indigo-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <ClipboardList className="h-5 w-5" />
            </div>
            {activeOrdersCount > 0 && (
              <span className="absolute top-4 right-4 bg-emerald-500 text-white font-black text-xs h-6 px-2 rounded-full flex items-center justify-center shadow animate-pulse">
                {activeOrdersCount} Active
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">My Orders</span>
                <span className="text-[10px] text-slate-400 font-medium">Track Order History</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>

          <div
            onClick={() => setWalletOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-955/30 text-emerald-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Campus Wallet</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">₹{user?.wallet !== undefined ? user.wallet.toFixed(2) : '0.00'}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Account Info & Delivery Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Account Details & Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">Account Details</h3>
            <p className="text-xs text-slate-400 mt-1">Your verified student account credentials and status.</p>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-5">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Full Name</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email Address</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Account Type</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-955/40 px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block">
                  Verified {user?.role || 'Student'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Saved Delivery Address</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user?.hostel && user?.room 
                    ? `${user.hostel}, Room ${user.room}` 
                    : 'No default address set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Delivery Address Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">Configure Delivery Address</h3>
            <p className="text-xs text-slate-400 mt-1">Set your permanent delivery destination to quickly check out orders.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {success && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-955/20 p-3 border border-red-200 dark:border-red-900/40 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hostel Block / Building</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Block B or PG Hostel" 
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <Home className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Room Number</label>
              <input 
                type="text" 
                placeholder="e.g. 402-B" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="auth-input" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Phone Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={updating}
              className="btn-primary w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs py-3 font-extrabold uppercase tracking-wider cursor-pointer shadow-md border-0"
            >
              {updating ? 'Saving preferences...' : 'Save Profile & Address'}
            </button>
          </form>
        </div>
      </div>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
};

export default Profile;

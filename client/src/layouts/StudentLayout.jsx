import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import WalletModal from '../components/WalletModal';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardList, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  ArrowRight,
  Wallet,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { orders, cart, clearCart } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Find student's active preparing/delivering orders
  const activeOrders = orders.filter(
    (o) => o.customer === user?.name && ['Ordered', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
  );

  const [walletOpen, setWalletOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home Page', path: '/student/dashboard', icon: LayoutDashboard },
    { 
      label: 'My Cart', 
      path: '/student/cart', 
      icon: ShoppingCart, 
      badge: cart && cart.length > 0 ? cart.reduce((s, i) => s + i.quantity, 0) : null 
    },
    { 
      label: 'My Orders', 
      path: '/student/orders', 
      icon: ClipboardList, 
      badge: activeOrders.length > 0 ? `${activeOrders.length} Active` : null 
    },
    { label: 'Full Profile Page', path: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Full-Width Top Navbar */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-6 z-30 sticky top-0">
        {/* Left Brand Header */}
        <div className="flex items-center gap-6">
          <Link to="/student/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-base">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              CampusBite
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-md hidden sm:inline-block">
              Student
            </span>
          </Link>

          {/* Header Navigation Buttons */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all no-underline ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label === 'Full Profile Page' ? 'Profile' : item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white text-orange-600' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Active Order Tracker Badge */}
          {activeOrders.length > 0 ? (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
              <span>Order #{activeOrders[0].id.slice(-6)}: <span className="font-extrabold uppercase text-orange-700 dark:text-orange-300">{activeOrders[0].status}</span></span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Ready to order? 🍕</span>
            </div>
          )}

          {/* Wallet Balance Button */}
          <button 
            onClick={() => setWalletOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/10 dark:bg-emerald-950/20 hover:bg-emerald-100/15 dark:hover:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
          >
            <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Wallet</span>
            <span>₹{user?.wallet !== undefined ? user.wallet.toFixed(2) : '0.00'}</span>
          </button>

          {/* Top-Right Profile Dropdown Anchor Container */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} 
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 pr-2.5 rounded-2xl transition-all cursor-pointer border border-slate-200/60 dark:border-slate-800"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                {user?.name?.[0] || 'S'}
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-white hidden sm:block">
                {user?.name.split(' ')[0]}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Top-Right Profile Dropdown Menu (Contains all sidebar features) */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in space-y-4">
                {/* User Header Profile Snippet */}
                <div 
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/student/profile');
                  }}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-orange-500/40 transition-all"
                >
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-base shrink-0 shadow-md">
                    {user?.name?.[0] || 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-wider block mt-0.5">View Full Profile →</span>
                  </div>
                </div>

                {/* Left Sidebar Links Menu */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2">Navigation Links</span>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                            isActive ? 'bg-white text-orange-600' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Account Actions & Utilities */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setWalletOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-4 w-4" />
                      <span>Recharge Wallet</span>
                    </div>
                    <span className="text-[10px] font-black">₹{user?.wallet !== undefined ? user.wallet.toFixed(2) : '0.00'}</span>
                  </button>

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-0"
                  >
                    <div className="flex items-center gap-3">
                      {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
                      <span>Theme Mode</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{darkMode ? 'Dark' : 'Light'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all cursor-pointer border-0"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Full Screen Width) */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

        {/* Floating Bottom Cart Popup Banner */}
        {cart && cart.length > 0 && location.pathname !== '/student/cart' && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md border border-slate-700/80 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-orange-500/30">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm block text-white truncate">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)} {cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'item' : 'items'} in Cart
                  </span>
                  <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 shrink-0">
                    ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 truncate mt-0.5 font-medium">
                  {cart.map(i => i.name).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] text-slate-400 hover:text-red-400 p-1.5 font-bold cursor-pointer transition-colors"
                title="Clear Cart"
              >
                Clear
              </button>
              <Link
                to="/student/cart"
                className="btn-primary py-2 px-3.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer border-0"
              >
                <span>View Cart</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Global Wallet Management Modal */}
        <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
};

export default StudentLayout;

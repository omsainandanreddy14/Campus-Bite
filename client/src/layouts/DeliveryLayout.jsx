import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletModal from '../components/WalletModal';
import { 
  LayoutDashboard, 
  Bike, 
  CheckSquare, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  Navigation,
  Wallet,
  ChevronDown
} from 'lucide-react';

const DeliveryLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
    { label: 'Home Page', path: '/delivery/dashboard', icon: LayoutDashboard },
    { label: 'Completed Deliveries', path: '/delivery/completed-orders', icon: CheckSquare },
    { label: 'Delivery Profile', path: '/delivery/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex flex-col transition-colors duration-300">
      {/* Full-Width Top Navbar */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-6 z-30 sticky top-0">
        {/* Left Brand Header */}
        <div className="flex items-center gap-6">
          <Link to="/delivery/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-base">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              CampusBite
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md hidden sm:inline-block">
              Delivery Partner
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
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Duty status interactive button */}
          <button 
            onClick={toggleDutyStatus}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              dutyStatus === 'Online' 
                ? 'bg-emerald-50 dark:bg-emerald-955/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-955/30 border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400'
            }`}
            title="Click to toggle Duty Status"
          >
            <span className={`h-2 w-2 rounded-full ${dutyStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{dutyStatus === 'Online' ? 'Duty Online' : 'Duty Offline'}</span>
          </button>

          {/* Wallet Balance Display */}
          <button 
            onClick={() => setWalletOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/10 dark:bg-emerald-955/20 hover:bg-emerald-100/15 dark:hover:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
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
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                {user?.name?.[0] || 'D'}
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-white hidden sm:block">
                {user?.name.split(' ')[0]}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Top-Right Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in space-y-4">
                {/* User Header Profile Snippet */}
                <div 
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/delivery/profile');
                  }}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-indigo-500/40 transition-all"
                >
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-black text-white text-base shrink-0 shadow-md">
                    {user?.name?.[0] || 'D'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider block mt-0.5">View Courier Profile →</span>
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
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
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
                      <span>Wallet Balance</span>
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

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
};

export default DeliveryLayout;

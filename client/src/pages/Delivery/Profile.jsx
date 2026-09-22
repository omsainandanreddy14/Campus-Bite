import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  User, 
  LayoutDashboard, 
  Bike, 
  CheckSquare, 
  LogOut, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const DeliveryProfile = () => {
  const { user, logout, updateProfileDetails } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }

    setUpdating(true);
    setSuccess('');
    setError('');

    const res = await updateProfileDetails({ name, email, phone });
    if (res.success) {
      setSuccess('Profile details updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
    setUpdating(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-3xl shadow-inner border-2 border-white/30">
              {user?.name?.[0] || 'D'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
                <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  Delivery Partner 🚴‍♂️
                </span>
              </div>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email}</span>
              </p>
              <p className="text-indigo-100 text-[11px] font-semibold flex items-center gap-2 pt-0.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{user?.phone || 'No phone number added'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer border border-white/20 self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards (Left Sidebar Columns Options) */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">
          Quick Access (Left Sidebar Columns)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/delivery/dashboard"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-955/30 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Home Page</span>
                <span className="text-[10px] text-slate-400 font-medium font-semibold">Deliveries & Metrics</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/delivery/completed-orders"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-955/30 text-emerald-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Completed</span>
                <span className="text-[10px] text-slate-400 font-medium font-semibold">Fulfilled Logs</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/delivery/profile"
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-955/30 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Delivery Profile</span>
                <span className="text-[10px] text-slate-400 font-medium font-semibold">Settings & Details</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Account Info & Editable Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Account Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">Delivery Credentials</h3>
            <p className="text-xs text-slate-400 mt-1">Your registered delivery partner credentials.</p>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-5">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Full Name</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email Address</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Courier Mobile</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.phone || 'No phone number set'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Partner Status</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-955/40 px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block">
                  Verified Delivery Fleet
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Settings Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">Configure Courier Details</h3>
            <p className="text-xs text-slate-400 mt-1">Set your account details and contact phone number.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {success && (
              <div className="text-xs font-semibold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-955/20 p-3 border border-red-200 dark:border-red-900/40 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
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
              className="btn-primary w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-xs py-3 font-extrabold uppercase tracking-wider cursor-pointer shadow-md border-0"
            >
              {updating ? 'Saving preferences...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;

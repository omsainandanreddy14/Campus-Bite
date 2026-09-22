import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, User, Mail, Phone, MapPin, CheckCircle, AlertTriangle, LayoutDashboard, ShoppingCart, ClipboardList, Wallet, LogOut } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, updateProfileDetails } = useAuth();
  const { cart, orders } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [room, setRoom] = useState(user?.room || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }

    setUpdating(true);
    setSuccess('');
    setError('');

    const profileData = {
      name,
      email,
      phone,
      hostel: user?.role === 'student' ? hostel : '',
      room: user?.role === 'student' ? room : '',
      address: user?.role === 'canteen' ? address : ''
    };

    const res = await updateProfileDetails(profileData);
    if (res.success) {
      setSuccess('Profile details updated successfully!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">My Account & Navigation</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 text-sm font-bold cursor-pointer border-0 bg-transparent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Navigation Links Grid for Left Sidebar Pages */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Quick Menu (Left Sidebar Options)</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick(`/${user?.role || 'student'}/dashboard`)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-955 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-100 dark:border-slate-850 cursor-pointer group shadow-sm"
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-orange-500 group-hover:text-white" />
              <span>Dashboard</span>
            </button>

            {user?.role === 'student' && (
              <button
                type="button"
                onClick={() => handleNavClick('/student/cart')}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-955 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-100 dark:border-slate-850 cursor-pointer group shadow-sm relative"
              >
                <ShoppingCart className="h-4.5 w-4.5 text-orange-500 group-hover:text-white" />
                <span>Cart</span>
                {cart && cart.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-orange-500 text-white group-hover:bg-white group-hover:text-orange-500 font-black h-4 w-4 rounded-full flex items-center justify-center shadow">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick(`/${user?.role || 'student'}/orders`)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-955 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-100 dark:border-slate-850 cursor-pointer group shadow-sm"
            >
              <ClipboardList className="h-4.5 w-4.5 text-orange-500 group-hover:text-white" />
              <span>Orders</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(`/${user?.role || 'student'}/profile`)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-955 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-100 dark:border-slate-850 cursor-pointer group shadow-sm"
            >
              <User className="h-4.5 w-4.5 text-orange-500 group-hover:text-white" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {success && (
            <div className="text-xs font-semibold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-955/20 p-3 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
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

          {/* Email */}
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

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Phone</label>
            <div className="relative">
              <input 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-input pl-10" 
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Role specific Location */}
          {user?.role === 'student' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hostel Block</label>
                <input 
                  type="text" 
                  placeholder="Block B" 
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="auth-input" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Room Number</label>
                <input 
                  type="text" 
                  placeholder="402" 
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="auth-input" 
                />
              </div>
            </div>
          )}

          {user?.role === 'canteen' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Canteen Stall Location / Address</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Campus Food Court, Stall 3" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="auth-input pl-10" 
                />
                <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 btn-secondary text-xs py-2.5 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updating}
              className="flex-1 btn-primary text-xs py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-650 hover:to-amber-600 font-bold cursor-pointer"
            >
              {updating ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;

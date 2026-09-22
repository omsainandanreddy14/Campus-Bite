import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, Shield, ShoppingBag, Truck, Store, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Address and Contact registration fields
  const [hostel, setHostel] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    // Role-specific address validations
    if (role === 'student' && (!hostel || !room || !phone)) {
      setError('Please fill in hostel block, room number, and phone number');
      return;
    }
    if (role === 'canteen' && (!address || !phone)) {
      setError('Please fill in canteen location/address and contact phone');
      return;
    }
    if (role === 'delivery' && !phone) {
      setError('Please fill in your contact phone number');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const additionalData = {
        hostel: role === 'student' ? hostel.trim() : '',
        room: role === 'student' ? room.trim() : '',
        phone: phone.trim(),
        address: role === 'canteen' ? address.trim() : ''
      };

      const res = await register(name, email, password, role, additionalData);
      if (res.success) {
        // Redirect based on role
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'canteen') navigate('/canteen/dashboard');
        else if (role === 'delivery') navigate('/delivery/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', desc: 'Order food to hostel', icon: ShoppingBag, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { id: 'canteen', label: 'Canteen Owner', desc: 'Manage food & kitchen', icon: Store, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { id: 'delivery', label: 'Delivery', desc: 'Deliver items on campus', icon: Truck, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { id: 'admin', label: 'Admin', desc: 'Oversee entire portal', icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-4 py-12 transition-colors duration-300">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/10 dark:bg-orange-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="w-full max-w-lg z-10 animate-slide-up">
        {/* Logo Banner */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-extrabold text-2xl mb-3">
            C
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Create your{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              CampusBite
            </span>{' '}
            Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join the campus meal ordering network
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-amber-50 dark:bg-amber-955/30 border border-amber-300/80 dark:border-amber-900/40 rounded-2xl text-amber-900 dark:text-amber-300 text-xs font-semibold space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-bold">{error}</span>
                </div>
                {(error.toLowerCase().includes('already') || error.toLowerCase().includes('exist') || error.toLowerCase().includes('log in')) && (
                  <Link
                    to="/login"
                    className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl text-center shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer border-0 uppercase tracking-wider"
                  >
                    <span>Already Have an Account? Log In Now →</span>
                  </Link>
                )}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Campus Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border-0 bg-transparent"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection Cards */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Choose your role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20 dark:bg-orange-950/10' 
                          : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mb-3 ${r.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.label}</span>
                      <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role-Specific Address & Contact Fields */}
            {role === 'student' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 animate-fade-in">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
                  Student hostel & contact details
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="hostel" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Hostel Block
                    </label>
                    <input
                      id="hostel"
                      type="text"
                      placeholder="e.g. Block PG"
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="room" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Room Number
                    </label>
                    <input
                      id="room"
                      type="text"
                      placeholder="e.g. 304"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            {role === 'canteen' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 animate-fade-in">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
                  Canteen storefront details
                </span>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Canteen Stall Location / Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="e.g. Campus Food Court, Stall 3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            {role === 'delivery' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 animate-fade-in">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                  Courier Contact Details
                </span>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

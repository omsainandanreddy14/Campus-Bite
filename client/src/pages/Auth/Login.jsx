import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect based on role
        const role = res.user.role;
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'canteen') navigate('/canteen/dashboard');
        else if (role === 'delivery') navigate('/delivery/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  const demoAccounts = [
    { role: 'Student', email: 'nani@gmail.com', color: 'border-orange-200 dark:border-orange-950/60 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600' },
    { role: 'Canteen', email: 'canteen@gmail.com', color: 'border-emerald-200 dark:border-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600' },
    { role: 'Delivery', email: 'delivery1@gmail.com', color: 'border-indigo-200 dark:border-indigo-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-650' },
    { role: 'Admin', email: 'omsainandanreddy@gmail.com', color: 'border-purple-200 dark:border-purple-950/60 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-4 py-12 transition-colors duration-300">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/10 dark:bg-orange-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="w-full max-w-md z-10 animate-slide-up">
        {/* Logo Banner */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-extrabold text-2xl mb-3">
            C
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Welcome back to{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              CampusBite
            </span>
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Fresh meals delivered straight to your hostel
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
              </div>
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accout Picker */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1 mb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Developer Quick Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  className={`px-3 py-2 text-xs font-medium border rounded-xl transition-all duration-200 truncate text-left ${account.color}`}
                >
                  {account.role} Demo
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

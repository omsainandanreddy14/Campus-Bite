import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowUpRight, ArrowDownRight, Wallet, Check, AlertCircle } from 'lucide-react';

const WalletModal = ({ isOpen, onClose }) => {
  const { user, deposit, withdraw, getWalletTransactions } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' or 'withdraw'
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const fetchTransactions = async () => {
    setTxLoading(true);
    const res = await getWalletTransactions();
    setTxLoading(false);
    if (res.success) {
      setTransactions(res.transactions || []);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
      setError('');
      setSuccess('');
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (activeTab === 'deposit') {
        res = await deposit(val);
      } else {
        res = await withdraw(val);
      }

      if (res.success) {
        setSuccess(`Successfully ${activeTab === 'deposit' ? 'deposited' : 'withdrawn'} ₹${val.toFixed(2)}!`);
        setAmount('');
        await fetchTransactions(); // Refresh ledger history list
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(res.error || `Failed to ${activeTab}`);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-y-auto animate-slide-up relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Wallet Management</h3>
              <p className="text-[10px] text-slate-450 font-semibold uppercase">Manage your funds</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance card */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl p-5 shadow-inner border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Current Balance</span>
            <span className="text-3xl font-black mt-1 block">₹{(user?.wallet || 0).toFixed(2)}</span>
            <span className="text-[10px] text-slate-450 mt-2 block italic">Logged in as {user?.name}</span>
          </div>

          {/* Form Actions */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-955/10 border border-red-200/60 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50/60 dark:bg-emerald-955/15 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Check className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('deposit'); setError(''); setSuccess(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'deposit' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
                }`}
              >
                Deposit Funds
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('withdraw'); setError(''); setSuccess(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'withdraw' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
                }`}
              >
                Withdraw Funds
              </button>
            </div>

            {/* Input Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount (INR)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 500"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="auth-input pl-10"
                  required
                />
                <span className="absolute left-4 top-3.5 text-xs font-extrabold text-slate-450">₹</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/10'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-indigo-500/10'
              }`}
            >
              {activeTab === 'deposit' ? (
                <>
                  <ArrowUpRight className="h-4.5 w-4.5" />
                  <span>{loading ? 'Processing...' : 'Confirm Deposit'}</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4.5 w-4.5" />
                  <span>{loading ? 'Processing...' : 'Confirm Withdrawal'}</span>
                </>
              )}
            </button>
          </form>

          {/* Recent Activity */}
          <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Recent Activity Ledger</h4>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {txLoading ? (
                <p className="text-center text-xs text-slate-400 py-6 font-medium animate-pulse">Loading transaction logs...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6 font-medium">No transaction records found.</p>
              ) : (
                transactions.map((tx) => {
                  const isDeposit = tx.type === 'Deposit';
                  const isWithdrawal = tx.type === 'Withdrawal';
                  const isPayment = tx.type === 'Payment';
                  
                  let iconColor = 'bg-slate-50 dark:bg-slate-850 text-slate-500';
                  let prefix = '';
                  let value = tx.amount;
                  let title = tx.type;

                  if (isDeposit) {
                    iconColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
                    prefix = '+';
                  } else if (isWithdrawal) {
                    iconColor = 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650';
                    prefix = '-';
                  } else if (isPayment) {
                    if (user?.role === 'student') {
                      iconColor = 'bg-red-55/10 dark:bg-red-950/20 text-red-650';
                      prefix = '-';
                      title = `Payment for order #${tx.orderId}`;
                    } else if (user?.role === 'canteen') {
                      iconColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
                      prefix = '+';
                      value = tx.canteenShare || tx.amount;
                      title = `Earnings for order #${tx.orderId}`;
                    } else if (user?.role === 'delivery') {
                      iconColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
                      prefix = '+';
                      value = tx.deliveryShare || 20.00;
                      title = `Payout for order #${tx.orderId}`;
                    } else if (user?.role === 'admin') {
                      iconColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
                      prefix = '+';
                      value = tx.adminShare || tx.amount;
                      title = `Fee share for order #${tx.orderId}`;
                    }
                  }

                  return (
                    <div key={tx._id || tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-100/50 dark:border-slate-850/40 rounded-xl text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                          {prefix === '+' ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownRight className="h-4.5 w-4.5" />}
                        </div>
                        <div className="text-left min-w-0 max-w-[180px]">
                          <p className="text-slate-850 dark:text-slate-200 truncate leading-snug">{title}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                            {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`font-bold ${prefix === '+' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {prefix}₹{value.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
